<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function options(): JsonResponse
    {
        return $this->response([
            'deliveryPence' => $this->deliveryPence(),
            'onlineAvailable' => $this->onlineAvailable(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'uuid'],
            'payment_method' => ['required', Rule::in(['cod', 'card'])],
            'customer_email' => ['required', 'email', 'max:254'],
            'delivery_full_name' => ['required', 'string', 'max:255'],
            'delivery_phone' => ['required', 'string', 'max:32'],
            'delivery_address_line_1' => ['required', 'string', 'max:255'],
            'delivery_address_line_2' => ['nullable', 'string', 'max:255'],
            'delivery_city' => ['required', 'string', 'max:255'],
            'delivery_postcode' => ['required', 'string', 'max:8', 'regex:/^(?:GIR ?0AA|[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})$/i'],
            'items' => ['required', 'array', 'list', 'max:30'],
            'items.*' => ['required', 'array:slug,variant_id,quantity,unit_pence'],
            'items.*.slug' => ['required', 'string', 'max:255'],
            'items.*.variant_id' => ['nullable', 'integer', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'between:1,99'],
            'items.*.unit_pence' => ['required', 'integer', 'between:1,1999'],
            'delivery_pence' => ['required', 'integer', 'min:0'],
        ]);

        $token = strtolower($data['token']);
        $fingerprint = hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
        $lookup = Order::query()->where('checkout_token', $token);
        $order = $lookup->first();
        if (! $order) {
            try {
                $order = DB::transaction(fn (): Order => $this->createOrder($data, $token, $fingerprint));
            } catch (UniqueConstraintViolationException $exception) {
                $order = $lookup->first() ?? throw $exception;
            }
        }

        abort_unless(hash_equals($order->checkout_fingerprint, $fingerprint), 409, 'This checkout reference is already in use.');

        return $this->response($this->summary($order));
    }

    public function show(string $token): JsonResponse
    {
        return $this->response($this->summary(Order::query()->where('checkout_token', $token)->firstOrFail()));
    }

    public function cancel(string $token): JsonResponse
    {
        $order = Order::query()->where('checkout_token', $token)->where('payment_method', 'card')->firstOrFail();
        if ($order->payment_status !== 'pending') {
            return $this->response($this->summary($order));
        }

        $reference = $order->payments()->sole()->transaction_reference;
        $stripe = Http::withToken(config('services.stripe.secret'))->connectTimeout(4)->timeout(10);
        $endpoint = 'https://api.stripe.com/v1/checkout/sessions/'.rawurlencode($reference);
        try {
            $response = $stripe->post($endpoint.'/expire');
            if (! $response->successful()) {
                $response = $stripe->get($endpoint);
            }
        } catch (ConnectionException) {
            abort(503, 'Could not cancel payment. Please try again.');
        }
        abort_unless($response->successful(), 503, 'Could not cancel payment. Please try again.');
        $session = $response->json();
        if (($session['status'] ?? null) === 'expired') {
            $this->syncPayment($session, 'checkout.session.expired');
        } elseif (($session['payment_status'] ?? null) === 'paid') {
            $this->syncPayment($session, 'checkout.session.completed');
        } else {
            abort(409, 'This payment could not be cancelled. Check its status before retrying.');
        }

        return $this->response($this->summary($order->refresh()));
    }

    public function webhook(Request $request): JsonResponse
    {
        $secret = config('services.stripe.webhook_secret');
        $payload = $request->getContent();
        $timestamp = null;
        $signatures = [];
        foreach (explode(',', (string) $request->header('Stripe-Signature')) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
            if ($key === 't') {
                $timestamp = $value;
            }
            if ($key === 'v1') {
                $signatures[] = $value;
            }
        }
        abort_unless($secret && ctype_digit((string) $timestamp) && abs(time() - (int) $timestamp) <= 300, 400);
        $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
        abort_unless(collect($signatures)->contains(fn (string $signature): bool => hash_equals($expected, $signature)), 400);

        $event = json_decode($payload, true);
        $type = $event['type'] ?? null;
        if (! in_array($type, ['checkout.session.completed', 'checkout.session.expired'], true)) {
            return $this->response(['received' => true]);
        }

        $this->syncPayment($event['data']['object'] ?? [], $type);

        return $this->response(['received' => true]);
    }

    private function syncPayment(array $session, string $type): void
    {
        DB::transaction(function () use ($session, $type): void {
            $token = $session['client_reference_id'] ?? null;
            if (! is_string($token)) {
                return;
            }

            $order = Order::query()->where('checkout_token', $token)->where('payment_method', 'card')->lockForUpdate()->first();
            if (! $order || $order->payment_status !== 'pending') {
                return;
            }
            $payment = $order->payments()->sole();
            if ($payment->transaction_reference !== ($session['id'] ?? null)
                || ($session['currency'] ?? null) !== 'gbp'
                || ($session['amount_total'] ?? null) !== (int) round((float) $order->total_amount * 100)) {
                return;
            }

            if ($type === 'checkout.session.completed' && ($session['payment_status'] ?? null) === 'paid') {
                $payment->update(['status' => 'paid', 'paid_at' => now()]);
                $order->update(['status' => 'confirmed', 'payment_status' => 'paid']);
            }
            if ($type === 'checkout.session.expired') {
                foreach ($payment->metadata['reserved_stock'] ?? [] as $inventoryId => $quantity) {
                    Inventory::query()->whereKey($inventoryId)->increment('available_quantity', $quantity);
                }
                $payment->update(['status' => 'expired']);
                $order->update(['status' => 'cancelled', 'payment_status' => 'expired']);
            }
        }, 3);

    }

    private function createOrder(array $data, string $token, string $fingerprint): Order
    {
        $online = $data['payment_method'] === 'card';
        abort_if($online && ! $this->onlineAvailable(), 503, 'Online payment is currently unavailable. Choose cash on delivery.');
        $delivery = $this->deliveryPence();
        abort_unless($delivery === (int) $data['delivery_pence'], 409, 'Delivery pricing changed. Reload checkout for the current total.');

        $visibleCategories = Category::visibleCategories()->modelKeys();
        $products = Product::query()->where('status', 'active')->whereIn('category_id', $visibleCategories)
            ->whereIn('slug', array_column($data['items'], 'slug'))
            ->with(['variants' => fn ($query) => $query->where('is_active', true)])
            ->get()->keyBy('slug');

        $lines = [];
        $stock = [];
        $subtotal = 0;
        foreach ($data['items'] as $item) {
            $product = $products->get($item['slug']);
            $variantId = $item['variant_id'] ?? null;
            $variant = $variantId !== null ? $product?->variants->find($variantId) : null;
            if (! $product || ($variantId !== null && ! $variant) || ($variantId === null && $product->variants->isNotEmpty())) {
                throw ValidationException::withMessages(['items' => 'An item or option is unavailable. Update your bag.']);
            }

            $key = $product->id.':'.$variantId;
            if (isset($lines[$key])) {
                throw ValidationException::withMessages(['items' => 'Each item and option must appear once.']);
            }

            $unitPence = (int) round((float) ($variant?->selling_price ?? $product->selling_price) * 100);
            if ($unitPence !== (int) $item['unit_pence']) {
                abort(409, 'A price changed. Reload checkout for the current total.');
            }
            $quantity = (int) $item['quantity'];
            $subtotal += $quantity * $unitPence;
            if ($variant) {
                $stock[$variant->id] = $quantity;
            }
            $lines[$key] = [
                'product_variant_id' => $variant?->id,
                'product_name' => $product->name,
                'sku' => $variant?->sku ?? $product->sku,
                'variant_options' => $variant ? ['name' => $variant->name ?? $variant->sku] : null,
                'quantity' => $quantity,
                'unit_price' => $unitPence / 100,
            ];
        }

        $order = Order::query()->create([
            'order_number' => '20ISH-'.Str::upper(Str::random(12)),
            'checkout_token' => $token,
            'checkout_fingerprint' => $fingerprint,
            'status' => $online ? 'pending' : 'confirmed',
            'payment_method' => $data['payment_method'],
            'payment_status' => 'pending',
            'currency' => 'GBP',
            'subtotal' => $subtotal / 100,
            'shipping_amount' => $delivery / 100,
            'total_amount' => ($subtotal + $delivery) / 100,
            'customer_email' => $data['customer_email'],
            'delivery_full_name' => $data['delivery_full_name'],
            'delivery_phone' => $data['delivery_phone'],
            'delivery_address_line_1' => $data['delivery_address_line_1'],
            'delivery_address_line_2' => $data['delivery_address_line_2'] ?? null,
            'delivery_city' => $data['delivery_city'],
            'delivery_postcode' => strtoupper($data['delivery_postcode']),
            'delivery_country' => 'GB',
        ]);
        $order->items()->createMany(array_values($lines));

        $reserved = [];
        $inventory = Inventory::query()->whereIn('product_variant_id', array_keys($stock))->orderBy('id')->lockForUpdate()->get();
        foreach ($inventory as $record) {
            $quantity = $stock[$record->product_variant_id];
            if ($record->available_quantity < $quantity) {
                throw ValidationException::withMessages(['items' => 'An item has insufficient stock. Reduce the quantity or update your bag.']);
            }
            $record->decrement('available_quantity', $quantity);
            $reserved[$record->id] = $quantity;
        }

        $session = $online ? $this->stripeSession($order, $lines, $delivery) : null;
        $order->payments()->create([
            'amount' => $order->total_amount,
            'currency' => 'GBP',
            'method' => $order->payment_method,
            'status' => 'pending',
            'provider' => $online ? 'stripe' : null,
            'transaction_reference' => $session['id'] ?? null,
            'metadata' => $online ? ['checkout_url' => $session['url'], 'reserved_stock' => $reserved] : null,
        ]);

        return $order;
    }

    private function stripeSession(Order $order, array $lines, int $delivery): array
    {
        $lineItems = [];
        foreach ($lines as $line) {
            $name = $line['product_name'];
            if ($line['variant_options']) {
                $name .= ' ('.$line['variant_options']['name'].')';
            }
            $lineItems[] = $this->stripeLine($name, (int) round($line['unit_price'] * 100), $line['quantity']);
        }
        if ($delivery > 0) {
            $lineItems[] = $this->stripeLine('UK delivery', $delivery, 1);
        }
        $origin = rtrim(config('app.storefront_url'), '/');

        try {
            $response = Http::asForm()->withToken(config('services.stripe.secret'))
                ->withHeaders(['Idempotency-Key' => '20ish-'.$order->checkout_token.'-'.$order->checkout_fingerprint])
                ->connectTimeout(4)->timeout(10)
                ->post('https://api.stripe.com/v1/checkout/sessions', [
                    'mode' => 'payment',
                    'payment_method_types' => ['card'],
                    'client_reference_id' => $order->checkout_token,
                    'customer_email' => $order->customer_email,
                    'line_items' => $lineItems,
                    'success_url' => $origin.'/checkout?order='.$order->checkout_token,
                    'cancel_url' => $origin.'/checkout?resume='.$order->checkout_token,
                ]);
        } catch (ConnectionException) {
            abort(503, 'Online payment is temporarily unavailable. Please try again.');
        }
        abort_unless($response->successful() && $response->json('id') && $response->json('url'), 503, 'Online payment is temporarily unavailable. Please try again.');

        return $response->json();
    }

    private function stripeLine(string $name, int $unitPence, int $quantity): array
    {
        return [
            'price_data' => [
                'currency' => 'gbp',
                'unit_amount' => $unitPence,
                'product_data' => ['name' => $name],
            ],
            'quantity' => $quantity,
        ];
    }

    private function summary(Order $order): array
    {
        return [
            'orderNumber' => $order->order_number,
            'status' => $order->status,
            'paymentMethod' => $order->payment_method,
            'paymentStatus' => $order->payment_status,
            'totalPence' => (int) round((float) $order->total_amount * 100),
            'paymentUrl' => $order->payment_method === 'card' && $order->payment_status === 'pending'
                ? $order->payments()->sole()->metadata['checkout_url']
                : null,
        ];
    }

    private function onlineAvailable(): bool
    {
        return config('services.stripe.enabled') && filled(config('services.stripe.secret')) && filled(config('services.stripe.webhook_secret'));
    }

    private function deliveryPence(): int
    {
        return max(0, (int) config('services.checkout.delivery_pence'));
    }

    private function response(array $data): JsonResponse
    {
        return response()->json($data)->header('Cache-Control', 'no-store');
    }
}

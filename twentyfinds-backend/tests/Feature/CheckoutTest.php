<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (getenv('CMS_TEST_MYSQL') !== '1') {
            $this->markTestSkipped('Set CMS_TEST_MYSQL=1 and DB_DATABASE for checkout integration tests.');
        }

        $database = getenv('DB_DATABASE');
        $this->assertNotEmpty($database);
        config([
            'database.default' => 'mysql',
            'database.connections.mysql.database' => $database,
            'services.checkout.delivery_pence' => 399,
            'app.storefront_url' => 'https://shop.example.test',
            'services.stripe.enabled' => false,
            'services.stripe.secret' => 'sk_test_fake',
            'services.stripe.webhook_secret' => 'whsec_fake',
        ]);

        DB::beginTransaction();
        $this->beforeApplicationDestroyed(fn () => DB::rollBack());
        Http::preventStrayRequests();
    }

    public function test_guest_order_with_cash_on_delivery_reaches_admin_once(): void
    {
        $data = $this->checkoutData();
        $this->getJson('/api/checkout')->assertExactJson(['deliveryPence' => 399, 'onlineAvailable' => false]);
        $this->postJson('/api/checkout', array_replace($data, ['payment_method' => 'card']))->assertServiceUnavailable();
        $this->postJson('/api/checkout', array_replace($data, ['delivery_pence' => 0]))->assertConflict();
        $wrongPrice = $data;
        $wrongPrice['items'][0]['unit_pence'] = 100;
        $this->postJson('/api/checkout', $wrongPrice)->assertConflict();
        $outOfStock = $data;
        $outOfStock['items'][0]['quantity'] = 6;
        $this->postJson('/api/checkout', $outOfStock)->assertUnprocessable()->assertJsonValidationErrors('items');
        $this->assertDatabaseMissing('orders', ['checkout_token' => $data['token']]);

        $result = $this->postJson('/api/checkout', $data)->assertOk()
            ->assertJsonPath('status', 'confirmed')->assertJsonPath('paymentStatus', 'pending')
            ->assertJsonPath('totalPence', 2899)->json();
        $this->postJson('/api/checkout', $data)->assertExactJson($result);
        $this->postJson('/api/checkout', array_replace($data, ['customer_email' => 'another@example.test']))->assertConflict();
        $order = Order::query()->where('checkout_token', $data['token'])->sole();
        $this->assertSame(2, $order->items()->sole()->quantity);
        $this->assertSame('12.50', $order->items()->sole()->unit_price);
        $this->assertSame(3, $order->items()->sole()->productVariant->inventory->available_quantity);
        $this->getJson('/api/checkout/'.$data['token'])->assertExactJson($result)->assertJsonMissingPath('customer_email');

        $this->get('/admin/orders')->assertRedirect();
        $this->actingAs(User::factory()->create())->get('/admin/orders')->assertForbidden();
        $statusUrl = '/admin/orders/'.$order->id.'/status';
        $this->patch($statusUrl, ['status' => 'delivered'])->assertForbidden();
        $owner = User::factory()->create();
        $owner->roles()->attach(Role::query()->firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']));
        $this->actingAs($owner)->get('/admin')->assertOk()->assertSee($order->order_number);
        $this->get('/admin/orders')->assertOk()->assertSee($order->order_number)->assertSee('Cash on delivery');
        $this->get('/admin/orders/'.$order->id)->assertOk()->assertSee('buyer@example.test')->assertSee('Record cash received');
        $this->patch($statusUrl, ['status' => 'paid'])->assertSessionHasErrors('status');
        $this->patch($statusUrl, ['status' => 'in_progress'])->assertRedirect();
        $this->get('/admin/orders')->assertOk()->assertSee('In progress');
        $this->patch($statusUrl, ['status' => 'delivered'])->assertRedirect();
        $this->get('/admin')->assertOk()->assertSee('Delivered');
        $this->getJson('/api/checkout/'.$data['token'])->assertJsonPath('status', 'delivered')->assertJsonPath('paymentStatus', 'pending');
        $this->post('/admin/orders/'.$order->id.'/cash-received')->assertRedirect();
        $this->getJson('/api/checkout/'.$data['token'])->assertJsonPath('paymentStatus', 'paid');
        $this->assertSame('paid', $order->payments()->sole()->status);
    }

    public function test_stripe_payment_requires_a_verified_session_and_is_idempotent(): void
    {
        config(['services.stripe.enabled' => true]);
        $data = $this->checkoutData('card');
        Http::fake(['https://api.stripe.com/v1/checkout/sessions' => Http::response([
            'id' => 'cs_test_paid',
            'url' => 'https://checkout.stripe.com/c/pay/cs_test_paid',
        ])]);

        $this->getJson('/api/checkout')->assertJsonPath('onlineAvailable', true);
        $this->postJson('/api/checkout', $data)->assertOk()->assertJsonPath('paymentStatus', 'pending')
            ->assertJsonPath('paymentUrl', 'https://checkout.stripe.com/c/pay/cs_test_paid');
        $this->postJson('/api/checkout', $data)->assertOk();
        Http::assertSentCount(1);
        Http::assertSent(fn ($request): bool => $request['mode'] === 'payment' && $request['client_reference_id'] === $data['token']
            && $request['line_items'][0]['price_data']['unit_amount'] === 1250
            && $request['line_items'][1]['price_data']['unit_amount'] === 399);

        $session = [
            'id' => 'cs_test_paid', 'client_reference_id' => $data['token'], 'currency' => 'gbp',
            'amount_total' => 2899, 'payment_status' => 'paid',
        ];
        $this->stripeEvent('checkout.session.completed', $session, false)->assertBadRequest();
        $this->stripeEvent('checkout.session.completed', array_replace($session, ['amount_total' => 1]))->assertOk();
        $this->getJson('/api/checkout/'.$data['token'])->assertJsonPath('paymentStatus', 'pending');
        $this->stripeEvent('checkout.session.completed', $session)->assertOk();
        $this->stripeEvent('checkout.session.completed', $session)->assertOk();
        $this->getJson('/api/checkout/'.$data['token'])->assertJsonPath('status', 'confirmed')
            ->assertJsonPath('paymentStatus', 'paid')->assertJsonPath('paymentUrl', null);
        $order = Order::query()->where('checkout_token', $data['token'])->sole();
        $this->assertSame(3, $order->items()->sole()->productVariant->inventory->available_quantity);
    }

    public function test_cancelling_stripe_payment_releases_stock_once(): void
    {
        config(['services.stripe.enabled' => true]);
        $data = $this->checkoutData('card');
        $session = [
            'id' => 'cs_test_cancelled', 'client_reference_id' => $data['token'], 'currency' => 'gbp',
            'amount_total' => 2899, 'payment_status' => 'unpaid', 'status' => 'expired',
        ];
        Http::fake([
            'https://api.stripe.com/v1/checkout/sessions' => Http::response([
                'id' => 'cs_test_cancelled', 'url' => 'https://checkout.stripe.com/c/pay/cs_test_cancelled',
            ]),
            'https://api.stripe.com/v1/checkout/sessions/cs_test_cancelled/expire' => Http::response($session),
        ]);
        $this->postJson('/api/checkout', $data)->assertOk();
        $this->postJson('/api/checkout/'.$data['token'].'/cancel')->assertOk()
            ->assertJsonPath('status', 'cancelled')->assertJsonPath('paymentStatus', 'expired');
        $this->stripeEvent('checkout.session.expired', $session)->assertOk();
        $order = Order::query()->where('checkout_token', $data['token'])->sole();
        $this->assertSame(5, $order->items()->sole()->productVariant->inventory->available_quantity);
    }

    private function checkoutData(string $method = 'cod'): array
    {
        $suffix = Str::lower(Str::random(12));
        $category = Category::query()->create(['name' => 'Checkout', 'slug' => 'checkout-'.$suffix, 'status' => 'active']);
        $product = $category->products()->create([
            'name' => 'Checkout item', 'slug' => 'item-'.$suffix, 'sku' => 'SKU-'.$suffix,
            'selling_price' => '10.00', 'status' => 'active',
        ]);
        $variant = $product->variants()->create(['sku' => 'VAR-'.$suffix, 'selling_price' => '12.50', 'is_active' => true]);
        $variant->inventory()->create(['available_quantity' => 5]);

        return [
            'token' => (string) Str::uuid(), 'payment_method' => $method, 'delivery_pence' => 399,
            'customer_email' => 'buyer@example.test', 'delivery_full_name' => 'Checkout Buyer',
            'delivery_phone' => '07123456789', 'delivery_address_line_1' => '1 Test Street',
            'delivery_city' => 'London', 'delivery_postcode' => 'SW1A 1AA',
            'items' => [['slug' => $product->slug, 'variant_id' => $variant->id, 'quantity' => 2, 'unit_pence' => 1250]],
        ];
    }

    private function stripeEvent(string $type, array $session, bool $validSignature = true): TestResponse
    {
        $body = json_encode(['type' => $type, 'data' => ['object' => $session]], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$body, $validSignature ? 'whsec_fake' : 'invalid');

        return $this->call('POST', '/api/payments/stripe/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_STRIPE_SIGNATURE' => 't='.$timestamp.',v1='.$signature,
        ], $body);
    }
}

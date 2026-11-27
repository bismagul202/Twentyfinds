<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class CmsOrderController extends Controller
{
    public function index(): View
    {
        return view('cms.orders', ['orders' => Order::query()->latest('id')->paginate(25)]);
    }

    public function show(Order $order): View
    {
        return view('cms.order', ['order' => $order->load('items')]);
    }

    public function cashReceived(Order $order): RedirectResponse
    {
        DB::transaction(function () use ($order): void {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            abort_unless($locked->payment_method === 'cod' && $locked->canUpdateFulfillment(), 409);
            if ($locked->payment_status === 'pending') {
                $locked->payments()->sole()->update(['status' => 'paid', 'paid_at' => now()]);
                $locked->update(['payment_status' => 'paid']);
            }
        });

        return to_route('cms.orders.show', $order)->with('notice', 'Cash payment recorded.');
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(array_keys(Order::FULFILLMENT_STATUSES))]]);

        DB::transaction(function () use ($order, $data): void {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            abort_unless($locked->canUpdateFulfillment(), 409);
            $locked->update(['status' => $data['status']]);
        });

        return to_route('cms.orders.show', $order)->with('notice', 'Order status updated.');
    }
}

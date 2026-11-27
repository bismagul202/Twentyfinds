@extends('cms.layout')
@section('title', $order->order_number)
@section('content')
    <a class="back" href="{{ route('cms.orders.index') }}">Back to orders</a>
    <h1>{{ $order->order_number }}</h1>
    <div class="panel">
        <div class="fields">
            <section>
                <h2>Delivery details</h2>
                <p>{{ $order->delivery_full_name }}<br>{{ $order->customer_email }}<br>{{ $order->delivery_phone }}</p>
                <p>{{ $order->delivery_address_line_1 }}<br>
                    @if ($order->delivery_address_line_2){{ $order->delivery_address_line_2 }}<br>@endif
                    {{ $order->delivery_city }} {{ $order->delivery_postcode }}<br>{{ $order->delivery_country }}</p>
            </section>
            <section>
                <h2>Payment</h2>
                <p>{{ $order->payment_method === 'cod' ? 'Cash on delivery' : ($order->payment_method === 'card' ? 'Online card' : $order->payment_method) }}
                    <span class="pill">{{ $order->payment_status }}</span></p>
                @if ($order->payment_method === 'cod' && $order->canUpdateFulfillment() && $order->payment_status === 'pending')
                    <form method="post" action="{{ route('cms.orders.cash', $order) }}">
                        @csrf
                        <button type="submit">Record cash received</button>
                    </form>
                @endif
            </section>
            <section>
                <h2>Order status</h2>
                @if ($order->canUpdateFulfillment())
                    <form method="post" action="{{ route('cms.orders.status', $order) }}" class="search">
                        @csrf
                        @method('PATCH')
                        <select name="status" aria-label="Order status" required>
                            @foreach (\App\Models\Order::FULFILLMENT_STATUSES as $status => $label)
                                <option value="{{ $status }}" @selected(old('status', $order->status) === $status)>{{ $label }}</option>
                            @endforeach
                        </select>
                        <button type="submit">Save status</button>
                    </form>
                @else
                    <p><span class="pill">{{ $order->fulfillmentLabel() }}</span></p>
                @endif
            </section>
        </div>
        <div class="scroll">
            <table>
                <thead><tr><th>Item</th><th>SKU</th><th>Quantity</th><th>Unit price</th></tr></thead>
                <tbody>
                    @foreach ($order->items as $item)
                        <tr><td>{{ $item->product_name }} {{ $item->variant_options['name'] ?? '' }}</td><td>{{ $item->sku }}</td>
                            <td>{{ $item->quantity }}</td><td>£{{ number_format((float) $item->unit_price, 2) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <p>Subtotal £{{ $order->subtotal }} · Delivery £{{ $order->shipping_amount }} · <strong>Total £{{ $order->total_amount }}</strong></p>
    </div>
@endsection

@extends('cms.layout')
@section('title', 'Orders')
@section('content')
    <h1>Orders</h1>
    <div class="panel scroll">
        <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Method</th><th>Payment</th><th>Status</th><th>Placed</th></tr></thead>
            <tbody>
                @forelse ($orders as $order)
                    <tr>
                        <td><a href="{{ route('cms.orders.show', $order) }}">{{ $order->order_number }}</a></td>
                        <td>{{ $order->delivery_full_name }}</td>
                        <td>£{{ number_format((float) $order->total_amount, 2) }}</td>
                        <td>{{ $order->payment_method === 'cod' ? 'Cash on delivery' : ($order->payment_method === 'card' ? 'Online card' : $order->payment_method) }}</td>
                        <td><span class="pill">{{ $order->payment_status }}</span></td>
                        <td><span class="pill">{{ $order->fulfillmentLabel() }}</span></td>
                        <td>{{ $order->created_at->format('d M Y H:i') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="7">No orders yet.</td></tr>
                @endforelse
            </tbody>
        </table>
        {{ $orders->links() }}
    </div>
@endsection

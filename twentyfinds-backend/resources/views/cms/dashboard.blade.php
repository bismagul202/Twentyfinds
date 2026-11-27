@extends('cms.layout')
@section('title', 'Overview')
@section('content')
    <header class="dashboard-heading dashboard-hero">
        <div>
            <h1>20ISH dashboard</h1>
            <p>Manage orders, your catalogue, campaigns and website pages.</p>
            <div class="dashboard-actions">
                <a class="button" href="{{ route('cms.edit', 'products') }}"><span aria-hidden="true">+</span> Add product</a>
                <a class="button quiet" href="{{ route('cms.orders.index') }}">View orders</a>
                <a class="button quiet" href="/">View 20ISH <span aria-hidden="true">&nearr;</span></a>
            </div>
        </div>
    </header>

    <section class="panel" aria-labelledby="recent-orders-heading">
        <h2 id="recent-orders-heading">Recent orders</h2>
        @if ($recentOrders->isEmpty())
            <p class="muted">No orders yet.</p>
        @else
            <div class="scroll">
                <table>
                    <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Method</th><th>Payment</th><th>Status</th></tr></thead>
                    <tbody>
                        @foreach ($recentOrders as $order)
                            <tr>
                                <td><a href="{{ route('cms.orders.show', $order) }}">{{ $order->order_number }}</a></td>
                                <td>{{ $order->delivery_full_name }}</td>
                                <td>£{{ number_format((float) $order->total_amount, 2) }}</td>
                                <td>{{ $order->payment_method === 'cod' ? 'Cash on delivery' : ($order->payment_method === 'card' ? 'Online card' : $order->payment_method) }}</td>
                                <td><span class="pill">{{ $order->payment_status }}</span></td>
                                <td><span class="pill">{{ $order->fulfillmentLabel() }}</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </section>

    <section class="catalogue-overview" aria-labelledby="catalogue-heading">
        <div class="dashboard-data-bar">
            <div>
                <h2 id="catalogue-heading">Content overview</h2>
                <p id="overview-status" role="status">Loading content…</p>
            </div>
            <button class="quiet" id="overview-refresh" type="button"><span aria-hidden="true">&#8635;</span> Refresh</button>
        </div>

        <div class="dashboard-metrics">
            @foreach ($sections as $name)
                <a class="panel metric" data-section="{{ $name }}" href="{{ $name === 'pages' ? route('cms.pages') : route('cms.section', $name) }}">
                    <span class="metric-heading">{{ ucfirst($name) }} <span aria-hidden="true">&nearr;</span></span>
                    <strong data-total>&mdash;</strong>
                    <progress max="100" value="0" data-progress aria-hidden="true"></progress>
                    <small data-breakdown>Awaiting totals</small>
                </a>
            @endforeach
        </div>
    </section>

    <div class="dashboard-panels">
        <section class="panel updates-panel" aria-labelledby="updates-heading">
            <h2 id="updates-heading">Recent updates</h2>
            <p class="muted">Latest changes to your catalogue, pages and banners.</p>
            <div class="dashboard-empty" id="overview-empty" hidden>
                <strong>No updates yet</strong>
                <p>Create a category, then add your first product.</p>
                <a href="{{ route('cms.edit', 'categories') }}">Create a category &rarr;</a>
            </div>
            <div class="scroll" id="overview-activity" hidden>
                <table class="updates-table">
                    <thead><tr><th scope="col">Item</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead>
                    <tbody id="overview-rows"></tbody>
                </table>
            </div>
            <template id="overview-row">
                <tr><td><a></a><small></small></td><td><span class="pill"></span></td><td class="muted"></td></tr>
            </template>
        </section>
        <section class="panel quick-panel" aria-labelledby="quick-heading">
            <h2 id="quick-heading">Quick actions</h2>
            @foreach ([
                ['Create a category', 'Organise the catalogue', route('cms.edit', 'categories')],
                ['Add a banner', 'Upload campaign artwork', route('cms.edit', 'banners')],
                ['Manage pages', 'Edit website content and metadata', route('cms.pages')],
                ['Edit 20ISH content', 'Update headings and labels', route('cms.copy')],
                ['Contact inbox', 'Read customer enquiries', route('cms.contact.index')],
            ] as [$label, $description, $href])
                <a href="{{ $href }}"><span><strong>{{ $label }}</strong><small>{{ $description }}</small></span><span aria-hidden="true">&rarr;</span></a>
            @endforeach
        </section>
    </div>

    <script type="module">
        const endpoint = @js(route('cms.overview.data', absolute: false));
        const status = document.getElementById('overview-status');
        const refresh = document.getElementById('overview-refresh');
        const metrics = document.querySelectorAll('[data-section]');
        const empty = document.getElementById('overview-empty');
        const activity = document.getElementById('overview-activity');
        const rows = document.getElementById('overview-rows');
        const template = document.getElementById('overview-row');
        const number = new Intl.NumberFormat('en-GB');

        async function loadOverview() {
            refresh.disabled = true;
            status.textContent = 'Loading content…';
            try {
                const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, cache: 'no-store' });
                if (response.status === 401 || response.status === 403) {
                    status.textContent = 'Session unavailable. Reload this page to sign in again.';
                    return;
                }
                if (!response.ok) throw new Error('Overview unavailable');
                const { sections, recent } = await response.json();
                for (const metric of metrics) {
                    const section = metric.dataset.section;
                    const { total, published, drafts } = sections[section];
                    metric.querySelector('[data-total]').textContent = number.format(total);
                    metric.querySelector('[data-progress]').value = total ? (published / total) * 100 : 0;
                    const liveLabel = section === 'pages' ? 'published' : 'active';
                    metric.querySelector('[data-breakdown]').textContent =
                        `${number.format(published)} ${liveLabel} · ${number.format(drafts)} drafts`;
                }
                rows.replaceChildren(...recent.map(record => {
                    const row = template.content.firstElementChild.cloneNode(true);
                    const link = row.querySelector('a');
                    link.href = record.href;
                    link.textContent = record.title;
                    row.querySelector('small').textContent = record.section;
                    const pill = row.querySelector('.pill');
                    pill.textContent = record.status;
                    pill.classList.toggle('pill-live', ['active', 'published'].includes(record.status));
                    row.lastElementChild.textContent = record.updated ?? '—';
                    return row;
                }));
                empty.hidden = recent.length > 0;
                activity.hidden = recent.length === 0;
                status.textContent = 'Last refreshed at ' + new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date());
            } catch {
                status.textContent = 'Overview could not be refreshed. Try again.';
            } finally {
                refresh.disabled = false;
            }
        }

        refresh.addEventListener('click', loadOverview);
        loadOverview();
    </script>
@endsection

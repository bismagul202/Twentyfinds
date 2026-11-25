@extends('cms.layout')
@section('title', 'Overview')
@section('content')
    <header class="dashboard-heading">
        <div>
            <p class="dashboard-label">Store overview</p>
            <h1>Dashboard</h1>
            <p class="muted">Manage your catalog and the content customers see on TWENTYFINDS.</p>
        </div>
        <a class="button" href="{{ route('cms.edit', 'products') }}"><span aria-hidden="true">+</span> Add product</a>
    </header>

    <section class="dashboard-metrics" aria-label="Store totals">
        @foreach ($sections as $name => $counts)
            <a class="panel metric" href="{{ ($name === 'pages' ? route('cms.pages') : route('cms.section', $name)) }}">
                <span class="metric-heading">{{ ucfirst($name) }} <span aria-hidden="true">&nearr;</span></span>
                <strong>{{ number_format($counts['total']) }}</strong>
                <small>{{ number_format($counts['published']) }} {{ $name === 'pages' ? 'published' : 'active' }} <span aria-hidden="true">&middot;</span> {{ number_format($counts['drafts']) }} drafts</small>
            </a>
        @endforeach
    </section>

    <div class="dashboard-panels">
        <section class="panel updates-panel" aria-labelledby="updates-heading">
            <h2 id="updates-heading">Recent updates</h2>
            @if ($recent->isEmpty())
                <div class="dashboard-empty">
                    <strong>No updates yet</strong>
                    <p>Create a category, then add a product to start your catalog.</p>
                    <a href="{{ route('cms.edit', 'categories') }}">Create a category &rarr;</a>
                </div>
            @else
                <div class="scroll">
                    <table class="updates-table">
                        <thead><tr><th scope="col">Item</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead>
                        <tbody>
                            @foreach ($recent as $record)
                                <tr>
                                    <td><a href="{{ route('cms.edit', [$record['section'], $record['id']]) }}">{{ $record['title'] }}</a><small>{{ ucfirst($record['section']) }}</small></td>
                                    <td><span @class(['pill', 'pill-live' => in_array($record['status'], ['active', 'published'], true)])>{{ $record['status'] }}</span></td>
                                    <td class="muted">{{ $record['updated']?->diffForHumans() ?? '-' }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </section>
        <section class="panel quick-panel" aria-labelledby="quick-heading">
            <h2 id="quick-heading">Quick actions</h2>
            @foreach ([
                ['Create a category', 'Organize the catalog', route('cms.edit', 'categories')],
                ['Add a banner', 'Upload campaign artwork', route('cms.edit', 'banners')],
                ['Create a page', 'Publish new website content', route('cms.edit', 'pages')],
                ['Edit storefront text', 'Update headings, labels and copy', route('cms.copy')],
            ] as [$label, $description, $href])
                <a href="{{ $href }}"><span><strong>{{ $label }}</strong><small>{{ $description }}</small></span><span aria-hidden="true">&rarr;</span></a>
            @endforeach
        </section>
    </div>
@endsection

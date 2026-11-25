@extends('cms.layout', ['section' => 'pages'])
@section('title', 'Pages')
@section('content')
    <header class="dashboard-heading">
        <div>
            <h1>Storefront pages</h1>
            <p class="muted">Find a storefront URL and open its content editor.</p>
        </div>
        <a class="button" href="{{ route('cms.edit', 'pages') }}">Add page</a>
    </header>
    <section class="panel pages-panel" aria-labelledby="all-pages">
        <div class="pages-table-heading">
            <div><h2 id="all-pages">All pages</h2><p class="muted">{{ $items->total() }} {{ Str::plural('page', $items->total()) }}</p></div>
            <form class="search" method="get" action="{{ route('cms.pages') }}">
                <input type="search" name="q" value="{{ $search }}" aria-label="Search page title or path" placeholder="Search title or URL">
                <select name="type" aria-label="Page type">
                    <option value="">All types</option>
                    @foreach (['Built-in', 'Custom page', 'Category', 'Product'] as $option)
                        <option value="{{ $option }}" @selected($type === $option)>{{ $option }}</option>
                    @endforeach
                </select>
                <select name="status" aria-label="Publication status">
                    <option value="">All statuses</option>
                    @foreach (['Published', 'Draft', 'Hidden', 'Unpublished'] as $option)
                        <option value="{{ $option }}" @selected($status === $option)>{{ $option }}</option>
                    @endforeach
                </select>
                <button class="quiet">Filter</button>
            </form>
        </div>
        <div class="scroll">
            <table class="pages-table">
                <thead><tr><th scope="col">Page</th><th scope="col">URL</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Manage</th></tr></thead>
                <tbody>
                    @forelse ($items as $row)
                        <tr>
                            <td><a class="page-row-title" href="{{ $row['edit'] }}">{{ $row['title'] }}</a><small>{{ $row['type'] }}</small></td>
                            <td>
                                @if ($row['status'] === 'Published')
                                    <a href="{{ rtrim(config('app.storefront_url'), '/').$row['path'] }}" target="_blank" rel="noopener">{{ $row['path'] }} <span aria-hidden="true">&nearr;</span></a>
                                @else
                                    <span class="muted">{{ $row['path'] }}</span>
                                @endif
                            </td>
                            <td><span @class(['pill', 'pill-live' => $row['status'] === 'Published'])>{{ $row['status'] }}</span></td>
                            <td class="muted">{{ $row['updated']?->format('d M Y') ?? '-' }}</td>
                            <td>
                                <div class="page-row-actions">
                                    <a href="{{ $row['edit'] }}">{{ $row['type'] === 'Built-in' ? 'Edit wording' : 'Edit' }}</a>
                                    @if ($row['contentEdit'] ?? null)<a href="{{ $row['contentEdit'] }}">Page content</a>@endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="5">No pages match your filters. <a href="{{ route('cms.pages') }}">Clear filters</a></td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if ($items->hasPages())
            <nav class="pagination pages-pagination" aria-label="Pagination">
                <span>{{ $items->firstItem() ?? 0 }}&ndash;{{ $items->lastItem() ?? 0 }} of {{ $items->total() }}</span>
                @if ($items->previousPageUrl())<a href="{{ $items->previousPageUrl() }}">Previous</a>@endif
                @if ($items->nextPageUrl())<a href="{{ $items->nextPageUrl() }}">Next</a>@endif
            </nav>
        @endif
    </section>
@endsection

@extends('cms.layout')
@section('title', ucfirst($section))
@section('content')
    @php($canDelete = in_array($section, ['products', 'categories'], true))
    <header class="catalogue-heading">
        <h1>{{ ucfirst($section) }}</h1>
        <a class="button" href="{{ route('cms.edit', $section) }}"><span aria-hidden="true">＋</span> Add {{ \Illuminate\Support\Str::singular($section) }}</a>
    </header>
    <div class="panel catalogue-panel">
    <div class="toolbar catalogue-toolbar">
        <form class="search" action="{{ route('cms.section', $section) }}">
            <input type="search" name="q" value="{{ $search }}" aria-label="Search {{ $section }}" placeholder="Search {{ $section }}">
            <button class="quiet">Search</button>
        </form>
        <span class="muted">{{ $items->total() }} {{ \Illuminate\Support\Str::plural(\Illuminate\Support\Str::singular($section), $items->total()) }}</span>
    </div>
    <div class="scroll">
        <table class="catalogue-table">
            <thead><tr><th scope="col">{{ ucfirst($title) }}</th><th scope="col">Status</th>@if ($section === 'products')<th scope="col">Price</th>@elseif ($section === 'banners')<th scope="col">Placement</th>@endif<th scope="col">Updated</th>@if ($canDelete)<th scope="col">Actions</th>@endif</tr></thead>
            <tbody>
                @forelse ($items as $item)
                    <tr>
                        <td>
                            <div class="catalogue-item">
                                @if ($canDelete)
                                    @php($photo = $section === 'products' ? $item->images->first()?->image_path : $item->image_path)
                                    @if ($photo)
                                        <img class="catalogue-thumbnail" src="{{ \App\Http\Controllers\CmsController::imageUrl($photo) }}" width="42" height="42" loading="lazy" alt="">
                                    @else
                                        <span class="catalogue-thumbnail catalogue-placeholder" aria-hidden="true">{{ mb_strtoupper(mb_substr($item->name, 0, 1)) }}</span>
                                    @endif
                                @endif
                                <div>
                                    <a href="{{ route('cms.edit', [$section, $item->id]) }}">{{ $item->$title }}</a>
                                    @if ($section === 'products')<small>{{ $item->sku }}</small>@endif
                                </div>
                            </div>
                        </td>
                        <td><span @class(['pill', 'catalogue-status', 'catalogue-status-live' => $item->status === 'active'])>{{ $item->status === 'active' ? 'Published' : $item->status }}</span></td>
                        @if ($section === 'products')<td>&pound;{{ $item->selling_price }}</td>@endif
                        @if ($section === 'banners')<td>{{ \App\Http\Controllers\CmsController::BANNER_PLACEMENTS[$item->placement] ?? $item->placement }}</td>@endif
                        <td>{{ $item->updated_at?->format('d M Y') }}</td>
                        @if ($canDelete)
                            <td class="catalogue-row-actions">
                                <button type="button" class="catalogue-action-trigger" popovertarget="actions-{{ $item->id }}" aria-label="Actions for {{ $item->$title }}">
                                    <span aria-hidden="true">&hellip;</span>
                                </button>
                                <div class="catalogue-actions" id="actions-{{ $item->id }}" popover>
                                    <a href="{{ route('cms.edit', [$section, $item->id]) }}">Edit</a>
                                    <form method="post" action="{{ route('cms.duplicate', [$section, $item->id]) }}">
                                        @csrf
                                        <button type="submit">Duplicate</button>
                                    </form>
                                    <a href="{{ route('cms.seo', [$section, $item->id]) }}">SEO</a>
                                    <a class="catalogue-delete" href="{{ route('cms.confirm-delete', [$section, $item->id]) }}" aria-label="Delete {{ $item->$title }}">Delete</a>
                                </div>
                            </td>
                        @endif
                    </tr>
                @empty
                    <tr><td colspan="{{ 3 + (int) ($section !== 'categories') + (int) $canDelete }}">No {{ $section }} found.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
        @if ($items->hasPages())
            <nav class="pagination" aria-label="Pagination">
                @if ($items->previousPageUrl())<a href="{{ $items->previousPageUrl() }}">Previous</a>@endif
                <span>Page {{ $items->currentPage() }} of {{ $items->lastPage() }}</span>
                @if ($items->nextPageUrl())<a href="{{ $items->nextPageUrl() }}">Next</a>@endif
            </nav>
        @endif
    </div>
    @if ($canDelete)
        <script type="module">
            const menus = document.querySelectorAll('.catalogue-actions');
            for (const menu of menus) {
                const trigger = document.querySelector(`[popovertarget="${menu.id}"]`);
                menu.addEventListener('toggle', ({ newState }) => {
                    if (newState !== 'open') return;
                    const anchor = trigger.getBoundingClientRect();
                    const { offsetWidth, offsetHeight } = menu;
                    const top = anchor.bottom + offsetHeight + 8 <= window.innerHeight
                        ? anchor.bottom + 6 : anchor.top - offsetHeight - 6;
                    menu.style.top = `${Math.max(8, top)}px`;
                    menu.style.left = `${Math.max(8, anchor.right - offsetWidth)}px`;
                });
            }
            function closeActions() {
                document.querySelector('.catalogue-actions:popover-open')?.hidePopover();
            }
            window.addEventListener('resize', closeActions);
            document.addEventListener('scroll', closeActions, true);
        </script>
    @endif
@endsection

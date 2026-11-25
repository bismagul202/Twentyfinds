@extends('cms.layout')
@section('title', ucfirst($section))
@section('content')
    <h1>{{ ucfirst($section) }}</h1>
    <div class="toolbar">
        <form class="search" action="{{ route('cms.section', $section) }}">
            <input type="search" name="q" value="{{ $search }}" aria-label="Search {{ $section }}" placeholder="Search {{ $section }}">
            <button class="quiet">Search</button>
        </form>
        <a class="button" href="{{ route('cms.edit', $section) }}">Add {{ \Illuminate\Support\Str::singular($section) }}</a>
    </div>
    <div class="panel scroll">
        <table>
            <thead><tr><th scope="col">{{ ucfirst($title) }}</th><th scope="col">Status</th>@if ($section === 'products')<th scope="col">Price</th>@endif<th scope="col">Updated</th></tr></thead>
            <tbody>
                @forelse ($items as $item)
                    <tr>
                        <td><a href="{{ route('cms.edit', [$section, $item->id]) }}">{{ $item->$title }}</a></td>
                        <td><span class="pill">{{ $item->status === 'active' ? 'Published' : $item->status }}</span></td>
                        @if ($section === 'products')<td>&pound;{{ $item->selling_price }}</td>@endif
                        <td>{{ $item->updated_at?->format('d M Y') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="{{ $section === 'products' ? 4 : 3 }}">No {{ $section }} found.</td></tr>
                @endforelse
            </tbody>
        </table>
        @if ($items->hasPages())
            <nav class="pagination" aria-label="Pagination">
                @if ($items->previousPageUrl())<a href="{{ $items->previousPageUrl() }}">Previous</a>@endif
                <span>Page {{ $items->currentPage() }} of {{ $items->lastPage() }}</span>
                @if ($items->nextPageUrl())<a href="{{ $items->nextPageUrl() }}">Next</a>@endif
            </nav>
        @endif
    </div>
@endsection

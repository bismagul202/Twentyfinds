@extends('cms.layout')
@section('title', 'Confirm deletion')
@section('content')
    <a class="back" href="{{ route('cms.section', $section) }}">Back to {{ $section }}</a>
    <div class="panel">
        <h1>Delete {{ $item->name }}?</h1>
        <p>This item will be removed from the catalogue and storefront.</p>
        <form method="post" action="{{ route('cms.destroy', [$section, $item->id]) }}" class="search">
            @csrf
            @method('DELETE')
            <button type="submit">Delete {{ \Illuminate\Support\Str::singular($section) }}</button>
            <a class="button quiet" href="{{ route('cms.section', $section) }}">Cancel</a>
        </form>
    </div>
@endsection

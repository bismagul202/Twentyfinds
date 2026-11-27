@extends('cms.layout')
@section('title', 'SEO settings')
@section('content')
    <a class="back" href="{{ route('cms.section', $section) }}">Back to {{ $section }}</a>
    <header class="catalogue-heading">
        <div><h1>SEO settings</h1><p class="muted">{{ $item->name }}</p></div>
        <a class="button quiet" href="{{ route('cms.edit', [$section, $item->id]) }}">Edit {{ \Illuminate\Support\Str::singular($section) }}</a>
    </header>
    <section class="panel catalogue-seo">
        <form method="post" action="{{ route('cms.seo.save', [$section, $item->id]) }}">
            @csrf
            @method('PATCH')
            <div class="fields">
                <label class="full">Search title
                    <input name="meta_title" value="{{ old('meta_title', $item->meta_title) }}" maxlength="150" placeholder="{{ $item->name }}">
                </label>
                <label class="full">Search description
                    <textarea name="meta_description" rows="4" maxlength="255">{{ old('meta_description', $item->meta_description) }}</textarea>
                    <small>Leave either field blank to use the catalogue content.</small>
                </label>
            </div>
            <button class="save" type="submit">Save SEO settings</button>
        </form>
    </section>
@endsection

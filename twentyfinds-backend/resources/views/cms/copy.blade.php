@extends('cms.layout')
@section('title', '20ISH content')
@section('content')
    <h1>20ISH content</h1>
    <p class="muted">Edit the wording customers see on 20ISH. Changes publish when you save. Clear a field to restore its default text.</p>
    <form class="toolbar" method="get" action="{{ route('cms.copy') }}">
        <label>Section
            <select name="group">
                @foreach ($groups as $group)
                    <option value="{{ $group }}" @selected($group === $selected)>{{ \Illuminate\Support\Str::headline($group) }}</option>
                @endforeach
            </select>
        </label>
        <button class="quiet">Open section</button>
    </form>
    <form class="panel" method="post" action="{{ route('cms.copy.update') }}">
        @csrf
        <input type="hidden" name="group" value="{{ $selected }}">
        <div class="fields">
            @foreach ($fields as $key => $default)
                <label @class(['full' => mb_strlen($default) > 85])>
                    {{ preg_replace('/\b(?:storefront|twentyfinds)\b/i', '20ISH', \Illuminate\Support\Str::headline(explode('.', $key, 2)[1])) }}
                    <textarea name="copy[{{ $key }}]" rows="{{ mb_strlen($default) > 85 ? 3 : 1 }}" maxlength="8000">{{ old('copy')[$key] ?? $overrides->get($key, $default) }}</textarea>
                    <small>Default: {{ $default }}</small>
                </label>
            @endforeach
        </div>
        <button class="save">Publish changes</button>
    </form>
@endsection

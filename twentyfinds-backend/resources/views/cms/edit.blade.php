@extends('cms.layout')
@php
    $record = \Illuminate\Support\Str::singular($section);
    $catalog = in_array($section, ['categories', 'products']);
    $name = $catalog ? 'name' : 'title';
    $copy = $section === 'pages' ? 'content' : 'description';
    $imageUrl = \App\Http\Controllers\CmsController::imageUrl($item->image_path);
@endphp
@section('title', ($item->exists ? 'Edit ' : 'Add ').$record)
@section('content')
    <a class="back" href="{{ ($section === 'pages' ? route('cms.pages') : route('cms.section', $section)) }}">Back to {{ $section }}</a>
    <h1>{{ $item->exists ? 'Edit' : 'Add' }} {{ $record }}</h1>
    <form class="panel" method="post" enctype="multipart/form-data" action="{{ route('cms.save', [$section, $item->id]) }}">
        @csrf
        <div class="fields">
            <label>{{ ucfirst($name) }}
                <input name="{{ $name }}" required maxlength="255" value="{{ old($name, $item->$name) }}">
            </label>
            <label>Status
                <select name="status">
                    <option value="draft" @selected(old('status', $item->status ?? 'draft') === 'draft')>Draft</option>
                    @php($published = $section === 'pages' ? 'published' : 'active')
                    <option value="{{ $published }}" @selected(old('status', $item->status) === $published)>Published</option>
                </select>
            </label>
            @if ($section !== 'banners')
                <label>URL slug
                    <input name="slug" pattern="[a-z0-9_-]+" maxlength="150" required value="{{ old('slug', $item->slug) }}">
                    <small>Use lowercase letters, numbers, hyphens or underscores.</small>
                    @if ($section === 'pages')<small>Use <code>homepage</code> to edit hero copy or <code>about</code>, <code>contact</code>, <code>faq</code>, <code>shipping</code>, <code>returns</code>, <code>privacy</code> or <code>terms</code> to edit an existing page. Use <code>site-announcement</code> or <code>site-footer</code> for those site-wide sections.</small>@endif
                </label>
            @endif

            @if ($catalog)
                @php($categoryField = $section === 'categories' ? 'parent_id' : 'category_id')
                <label>{{ $section === 'categories' ? 'Parent category' : 'Category' }}
                    <select name="{{ $categoryField }}" @required($section === 'products')>
                        <option value="">{{ $section === 'categories' ? 'Top-level category' : 'Select a category' }}</option>
                        @foreach ($categories as $category)
                            @if ($section !== 'categories' || $item->id !== $category->id)
                                <option value="{{ $category->id }}" @selected((string) old($categoryField, $item->$categoryField) === (string) $category->id)>{{ $category->name }}</option>
                            @endif
                        @endforeach
                    </select>
                </label>
            @endif

            @if ($section === 'products')
                <label>SKU <input name="sku" required maxlength="255" value="{{ old('sku', $item->sku) }}"></label>
                <label>Selling price (GBP) <input type="number" min="0.01" max="19.99" step="0.01" name="selling_price" required value="{{ old('selling_price', $item->selling_price) }}"></label>
                <label>Previous price (GBP) <input type="number" min="0.02" max="99999999.99" step="0.01" name="compare_at_price" value="{{ old('compare_at_price', $item->compare_at_price) }}"><small>Optional. Enter a genuine previous price to show an offer.</small></label>
                <div class="checks">
                    <input type="hidden" name="is_featured" value="0"><label><input type="checkbox" name="is_featured" value="1" @checked(old('is_featured', $item->is_featured))> Featured</label>
                    <input type="hidden" name="is_bestseller" value="0"><label><input type="checkbox" name="is_bestseller" value="1" @checked(old('is_bestseller', $item->is_bestseller))> Bestseller</label>
                </div>
                <label class="full">Add product photos
                    <input type="file" name="images[]" accept="image/jpeg,image/png,image/webp" multiple>
                    <small>Up to 8 photos per save. JPG, PNG or WebP, up to 2 MB each and 7 MB total.</small>
                </label>
            @endif

            @if ($section === 'banners')
                <label>Placement
                    <select name="placement">
                        @foreach (\App\Http\Controllers\CmsController::BANNER_PLACEMENTS as $value => $label)
                            <option value="{{ $value }}" @selected(old('placement', $item->placement === 'hero' ? 'homepage' : $item->placement) === $value)>{{ $label }}</option>
                        @endforeach
                    </select>
                </label>
                <label>Button destination <input name="target_url" placeholder="/shop" value="{{ old('target_url', $item->target_url) }}"><small>Optional storefront path, such as /shop or /shop?deals=1.</small></label>
                <label>Starts at (UTC) <input type="datetime-local" name="starts_at" value="{{ old('starts_at', $item->starts_at?->format('Y-m-d\TH:i')) }}"></label>
                <label>Ends at (UTC) <input type="datetime-local" name="ends_at" value="{{ old('ends_at', $item->ends_at?->format('Y-m-d\TH:i')) }}"></label>
            @endif

            @if (in_array($section, ['categories', 'banners']))
                <label>Display order <input type="number" name="sort_order" required min="0" max="65535" value="{{ old('sort_order', $item->sort_order ?? 0) }}"><small>Lower numbers appear first.</small></label>
                <label class="full">Image
                    @if ($imageUrl)<img class="preview" src="{{ $imageUrl }}" alt="Current image">@endif
                    <input type="file" name="image" accept="image/jpeg,image/png,image/webp" @required($section === 'banners' && ! $imageUrl)>
                    <small>JPG, PNG or WebP, up to 2 MB.</small>
                </label>
            @endif

            @if ($section !== 'banners')
                <label class="full">{{ ucfirst($copy) }} <textarea name="{{ $copy }}" rows="{{ $section === 'pages' ? 11 : 5 }}" maxlength="30000">{{ old($copy, $item->$copy) }}</textarea></label>
            @endif
            @if ($section === 'pages')
                <label>SEO title <input name="meta_title" maxlength="150" value="{{ old('meta_title', $item->meta_title) }}"></label>
                <label>SEO description <input name="meta_description" maxlength="255" value="{{ old('meta_description', $item->meta_description) }}"></label>
            @endif
        </div>
        <button class="save">Save changes</button>
    </form>

    @if ($section === 'products' && $item->exists)
        <section class="panel save">
            <h2>Product variants</h2>
            <p class="muted">Use a name such as Small / Burgundy. Leave the price empty to use the product price.</p>
            @foreach ($item->variants as $option)
                <details class="variant-entry">
                    <summary>{{ $option->name ?: $option->sku }} &middot; {{ $option->is_active ? 'Published' : 'Draft' }}</summary>
                    @include('cms.variant', ['product' => $item, 'option' => $option])
                </details>
            @endforeach
            <h3>Add variant</h3>
            @include('cms.variant', ['product' => $item, 'option' => null])
        </section>
    @endif

    @if ($section === 'products' && $item->exists && $item->images->isNotEmpty())
        <section class="panel save">
            <h2>Product photos</h2>
            <div class="photos">
                @foreach ($item->images->sortByDesc('is_primary') as $photo)
                    <article class="photo">
                        <img src="{{ \App\Http\Controllers\CmsController::imageUrl($photo->image_path) }}" alt="{{ $photo->alt_text ?: $item->name }}">
                        <div class="photo-actions">
                            @if ($photo->is_primary)
                                <span class="pill">Primary</span>
                            @else
                                <form method="post" action="{{ route('cms.image', [$item, $photo, 'primary']) }}">@csrf<button class="quiet">Set primary</button></form>
                            @endif
                            <form method="post" action="{{ route('cms.image', [$item, $photo, 'remove']) }}">@csrf<button class="quiet">Remove</button></form>
                        </div>
                    </article>
                @endforeach
            </div>
        </section>
    @endif
@endsection

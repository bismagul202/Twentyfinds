<form method="post" action="{{ route('cms.variant', [$product, $option?->id]) }}">
    @csrf
    <div class="fields">
        <label>Variant name <input name="variant_name" maxlength="255" required value="{{ $option?->name }}"></label>
        <label>Variant SKU <input name="variant_sku" maxlength="255" required value="{{ $option?->sku }}"></label>
        <label>Price override (GBP) <input name="variant_price" type="number" min="0.01" max="19.99" step="0.01" value="{{ $option?->selling_price }}"></label>
        <div class="checks">
            <label><input name="variant_active" type="checkbox" value="1" @checked($option?->is_active)> Published</label>
            <label><input name="variant_default" type="checkbox" value="1" @checked($option?->is_default)> Default</label>
        </div>
    </div>
    <button class="save">{{ $option ? 'Save variant' : 'Add variant' }}</button>
</form>

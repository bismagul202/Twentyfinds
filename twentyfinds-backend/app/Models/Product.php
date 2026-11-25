<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Validator;

#[Fillable([
    'category_id',
    'name',
    'slug',
    'sku',
    'description',
    'short_description',
    'purchase_cost',
    'selling_price',
    'compare_at_price',
    'is_featured',
    'is_bestseller',
    'status',
])]
class Product extends Model
{
    use SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (Product $product): void {
            Validator::validate(
                ['selling_price' => $product->selling_price],
                ['selling_price' => ['required', 'numeric', 'decimal:0,2', 'between:0.01,19.99']]
            );
        });
    }

    protected function casts(): array
    {
        return [
            'purchase_cost' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_bestseller' => 'boolean',
        ];
    }

    protected function stockQuantity(): Attribute
    {
        return Attribute::get(fn (): int => (int) $this->inventory()->sum('available_quantity'));
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function inventory(): HasManyThrough
    {
        return $this->hasManyThrough(Inventory::class, ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }
}

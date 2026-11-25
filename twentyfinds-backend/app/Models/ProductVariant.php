<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Validator;

#[Fillable([
    'product_id',
    'name',
    'sku',
    'options',
    'purchase_cost',
    'selling_price',
    'is_default',
    'is_active',
])]
class ProductVariant extends Model
{
    use SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (ProductVariant $variant): void {
            if ($variant->selling_price !== null) {
                Validator::validate(
                    ['selling_price' => $variant->selling_price],
                    ['selling_price' => ['numeric', 'decimal:0,2', 'between:0.01,19.99']]
                );
            }
        });
    }

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'purchase_cost' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}

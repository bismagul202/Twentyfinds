<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'order_id',
    'product_variant_id',
    'product_name',
    'sku',
    'variant_options',
    'quantity',
    'unit_price',
])]
class OrderItem extends Model
{
    protected function casts(): array
    {
        return [
            'variant_options' => 'array',
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(ReturnRequest::class);
    }
}

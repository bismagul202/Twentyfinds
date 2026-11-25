<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'code',
    'description',
    'discount_type',
    'discount_value',
    'minimum_subtotal',
    'maximum_discount',
    'usage_limit',
    'per_customer_limit',
    'starts_at',
    'ends_at',
    'is_active',
])]
class Coupon extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'minimum_subtotal' => 'decimal:2',
            'maximum_discount' => 'decimal:2',
            'usage_limit' => 'integer',
            'per_customer_limit' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}

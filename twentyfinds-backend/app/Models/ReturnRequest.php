<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'order_id',
    'order_item_id',
    'customer_id',
    'quantity',
    'status',
    'reason',
    'resolution_notes',
    'requested_at',
])]
class ReturnRequest extends Model
{
    protected $table = 'returns';

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'requested_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class, 'return_id');
    }
}

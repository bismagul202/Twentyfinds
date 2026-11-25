<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Validator;

#[Fillable(['user_id', 'session_token', 'status'])]
class Cart extends Model
{
    use SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (Cart $cart): void {
            Validator::validate(
                ['user_id' => $cart->user_id, 'session_token' => $cart->session_token],
                [
                    'user_id' => ['required_without:session_token'],
                    'session_token' => ['required_without:user_id'],
                ]
            );
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }
}

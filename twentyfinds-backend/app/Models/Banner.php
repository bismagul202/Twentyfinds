<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'title',
    'image_path',
    'target_url',
    'placement',
    'status',
    'sort_order',
    'starts_at',
    'ends_at',
])]
class Banner extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }
}

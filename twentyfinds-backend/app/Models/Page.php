<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'title',
    'slug',
    'content',
    'meta_title',
    'meta_description',
    'status',
    'published_at',
])]
class Page extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }
}

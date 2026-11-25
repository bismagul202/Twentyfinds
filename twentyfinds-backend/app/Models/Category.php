<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'parent_id',
    'name',
    'slug',
    'description',
    'image_path',
    'status',
    'sort_order',
])]
class Category extends Model
{
    use SoftDeletes;

    public static function visibleCategories(): Collection
    {
        $activeCategories = static::query()->where('status', 'active')->orderBy('sort_order')->orderBy('name')->get();
        $children = $activeCategories->groupBy('parent_id');
        $visibleCategories = $children->get('', new Collection)->values();
        for ($index = 0; $index < $visibleCategories->count(); $index++) {
            foreach ($children->get($visibleCategories[$index]->id, []) as $child) {
                $visibleCategories->push($child);
            }
        }

        return $visibleCategories;
    }

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}

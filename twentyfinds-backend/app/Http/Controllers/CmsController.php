<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use RuntimeException;
use Throwable;

class CmsController extends Controller
{
    public const BANNER_PLACEMENTS = [
        'homepage' => 'Homepage hero',
        'promotion' => 'Promotion',
        'seasonal' => 'Seasonal edit',
        'seasonal-secondary' => 'Seasonal secondary image',
        'budget-5' => 'Under GBP 5 tile',
        'budget-10' => 'Under GBP 10 tile',
        'budget-20' => 'Under GBP 20 tile',
    ];

    public const SECTIONS = [
        'products' => Product::class,
        'categories' => Category::class,
        'banners' => Banner::class,
        'pages' => Page::class,
    ];

    public function dashboard(Request $request): View
    {
        if (! $request->user()) {
            return view('cms.login');
        }

        Gate::authorize('manage-cms');

        $sections = collect(self::SECTIONS)->map(function (string $model, string $section): array {
            $published = $section === 'pages' ? 'published' : 'active';
            $counts = $model::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

            return [
                'total' => (int) $counts->sum(),
                'published' => (int) $counts->get($published, 0),
                'drafts' => (int) $counts->get('draft', 0),
            ];
        });

        $recent = collect(self::SECTIONS)->flatMap(function (string $model, string $section) {
            $label = in_array($section, ['products', 'categories'], true) ? 'name' : 'title';

            return $model::query()->latest('updated_at')->latest('id')->limit(6)
                ->get(['id', $label, 'status', 'updated_at'])
                ->map(fn (Model $item): array => [
                    'section' => $section,
                    'id' => $item->getKey(),
                    'title' => $item->$label,
                    'status' => $item->status,
                    'updated' => $item->updated_at,
                ]);
        })->sortByDesc('updated')->take(6);

        return view('cms.dashboard', compact('sections', 'recent'));
    }

    public function index(Request $request, string $section = 'products'): View
    {
        $search = $request->string('q')->trim()->limit(100)->toString();
        $title = in_array($section, ['products', 'categories'], true) ? 'name' : 'title';
        $items = $this->model($section)->newQuery()
            ->when($search !== '', fn ($query) => $query->whereLike($title, '%'.$search.'%'))
            ->latest('id')->paginate(25)->withQueryString();

        return view('cms.index', compact('section', 'items', 'title', 'search'));
    }

    public function edit(Request $request, string $section, ?int $id = null): View
    {
        $item = $this->item($section, $id);
        $preset = $request->string('preset')->toString();
        if ($section === 'pages' && $id === null && isset(CmsPageIndexController::BUILT_IN[$preset]) && $preset !== 'shop') {
            $existing = Page::query()->where('slug', $preset)->first();
            $item = $existing ?? $item->fill([
                'slug' => $preset, 'title' => CmsPageIndexController::BUILT_IN[$preset][0], 'status' => 'draft',
            ]);
        }
        $categories = in_array($section, ['categories', 'products'], true)
            ? Category::query()->orderBy('name')->get(['id', 'name'])
            : collect();

        return view('cms.edit', compact('section', 'item', 'categories'));
    }

    public function save(Request $request, string $section, ?int $id = null): RedirectResponse
    {
        $item = $this->item($section, $id);
        $data = $request->validate($this->rules($section, $item));
        $uploads = [];

        try {
            DB::transaction(function () use ($request, $item, $data, &$uploads): void {
                $data = collect($data)->except(['image', 'images'])->all();
                if ($item instanceof Category) {
                    $this->validateParent($item, $data['parent_id'] ?? null);
                }
                if ($item instanceof Product) {
                    $data['is_featured'] = $request->boolean('is_featured');
                    $data['is_bestseller'] = $request->boolean('is_bestseller');
                }
                if ($item instanceof Page) {
                    $data['published_at'] = $data['status'] === 'published' ? ($item->published_at ?? now()) : null;
                }
                if ($request->hasFile('image')) {
                    $data['image_path'] = $uploads[] = $this->storeImage($request->file('image'));
                }
                $item->fill($data)->save();
                if ($item instanceof Product && $request->hasFile('images')) {
                    $nextOrder = (int) $item->images()->max('sort_order');
                    foreach ($request->file('images') as $image) {
                        $item->images()->create([
                            'image_path' => $uploads[] = $this->storeImage($image),
                            'sort_order' => ++$nextOrder,
                        ]);
                    }
                }
            });
        } catch (Throwable $exception) {
            Storage::disk('public')->delete($uploads);
            throw $exception;
        }

        return to_route('cms.edit', [$section, $item->getKey()])->with('notice', 'Changes saved.');
    }

    public function image(Product $product, int $image, string $action): RedirectResponse
    {
        DB::transaction(function () use ($product, $image, $action): void {
            Product::query()->lockForUpdate()->findOrFail($product->id);
            $photo = $product->images()->findOrFail($image);
            if ($action === 'remove') {
                $photo->delete();

                return;
            }

            $product->images()->update(['is_primary' => false]);
            $photo->update(['is_primary' => true]);
        });

        return to_route('cms.edit', ['products', $product->id])->with('notice', 'Product images updated.');
    }

    public function variant(Request $request, Product $product, ?int $variant = null): RedirectResponse
    {
        $option = $variant === null ? new ProductVariant : $product->variants()->findOrFail($variant);
        $data = $request->validate([
            'variant_name' => ['required', 'string', 'max:255'],
            'variant_sku' => ['required', 'string', 'max:255', Rule::unique('product_variants', 'sku')->ignore($option)],
            'variant_price' => ['nullable', 'numeric', 'decimal:0,2', 'between:0.01,19.99'],
            'variant_active' => ['sometimes', 'boolean'],
            'variant_default' => ['sometimes', 'boolean'],
        ]);

        DB::transaction(function () use ($product, $option, $data, $request): void {
            Product::query()->lockForUpdate()->findOrFail($product->id);
            $active = $request->boolean('variant_active');
            $default = $active && $request->boolean('variant_default');
            if ($default) {
                $product->variants()->update(['is_default' => false]);
            }
            $option->fill([
                'name' => $data['variant_name'],
                'sku' => $data['variant_sku'],
                'selling_price' => $data['variant_price'] ?? null,
                'is_active' => $active,
                'is_default' => $default,
            ]);
            $product->variants()->save($option);
        });

        return to_route('cms.edit', ['products', $product->id])->with('notice', 'Product variant saved.');
    }

    private function model(string $section): Model
    {
        return new (self::SECTIONS[$section]);
    }

    private function item(string $section, ?int $id): Model
    {
        $model = $this->model($section);

        return $id === null ? $model : $model->newQuery()->findOrFail($id);
    }

    private function rules(string $section, Model $item): array
    {
        $status = ['required', Rule::in(['draft', 'active'])];
        $name = ['required', 'string', 'max:255'];
        $slug = ['required', 'alpha_dash:ascii', 'lowercase', 'max:150', Rule::unique($item->getTable(), 'slug')->ignore($item)];
        $copy = ['nullable', 'string', 'max:30000'];
        $order = ['required', 'integer', 'min:0', 'max:65535'];
        $image = ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=6000,max_height=6000'];

        return match ($section) {
            'products' => [
                'name' => $name, 'slug' => $slug, 'status' => $status,
                'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
                'sku' => [...$name, Rule::unique('products', 'sku')->ignore($item)],
                'description' => $copy,
                'selling_price' => ['required', 'numeric', 'decimal:0,2', 'between:0.01,19.99'],
                'compare_at_price' => ['nullable', 'numeric', 'decimal:0,2', 'gt:selling_price', 'max:99999999.99'],
                'is_featured' => ['sometimes', 'boolean'],
                'is_bestseller' => ['sometimes', 'boolean'],
                'images' => ['sometimes', 'bail', 'array', 'max:8', function (string $attribute, array $files, \Closure $fail): void {
                    $total = collect($files)->sum(fn ($file): int => $file instanceof UploadedFile ? (int) $file->getSize() : 0);
                    if ($total > 7 * 1024 * 1024) {
                        $fail('Upload up to 7 MB of photos per save.');
                    }
                }],
                'images.*' => $image,
            ],
            'categories' => [
                'name' => $name, 'slug' => $slug, 'status' => $status,
                'parent_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
                'description' => $copy, 'sort_order' => $order,
                'image' => ['nullable', ...$image],
            ],
            'banners' => [
                'title' => $name, 'status' => $status, 'sort_order' => $order,
                'placement' => ['required', Rule::in(array_keys(self::BANNER_PLACEMENTS))],
                'target_url' => ['nullable', 'string', 'max:255', 'regex:~^/(?![/\\\\])[^\\\\\s]*$~'],
                'starts_at' => ['nullable', 'date'],
                'ends_at' => ['nullable', 'date', 'after:starts_at'],
                'image' => [$item->image_path ? 'nullable' : 'required', ...$image],
            ],
            'pages' => [
                'title' => $name, 'slug' => $slug, 'content' => $copy,
                'status' => ['required', Rule::in(['draft', 'published'])],
                'meta_title' => ['nullable', 'string', 'max:150'],
                'meta_description' => ['nullable', 'string', 'max:255'],
            ],
        };
    }

    private function validateParent(Category $item, ?int $parentId): void
    {
        if ($parentId === null) {
            return;
        }

        $parents = Category::query()->orderBy('id')->lockForUpdate()->pluck('parent_id', 'id');
        $visited = [];
        while ($parentId !== null) {
            if ($parentId === $item->id || isset($visited[$parentId])) {
                throw ValidationException::withMessages(['parent_id' => 'Choose a parent outside this category tree.']);
            }
            $visited[$parentId] = true;
            $parentId = $parents->get($parentId);
        }
    }

    private function storeImage(UploadedFile $image): string
    {
        $path = $image->store('cms', 'public');
        if ($path === false) {
            throw new RuntimeException('The image could not be saved.');
        }

        return $path;
    }

    public static function imageUrl(?string $path): string
    {
        if (! $path) {
            return '';
        }

        if (preg_match('~^cms/([A-Za-z0-9]{40}\.(?:jpe?g|png|webp))$~i', $path, $match)) {
            return route('cms.media', ['file' => $match[1]]);
        }

        return str_starts_with($path, 'https://') ? $path : Storage::disk('public')->url($path);
    }
}

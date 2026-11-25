<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StorefrontController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $visibleCategories = Category::visibleCategories();
        $categoryIndex = $visibleCategories->keyBy('id');

        $products = Product::query()->where('status', 'active')
            ->whereIn('category_id', $categoryIndex->keys())
            ->with([
                'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order')->orderBy('id'),
                'variants' => fn ($query) => $query->where('is_active', true)->orderByDesc('is_default')->orderBy('id'),
            ])
            ->withCount(['reviews as approved_reviews_count' => fn ($query) => $query->where('status', 'approved')])
            ->withAvg(['reviews as approved_rating' => fn ($query) => $query->where('status', 'approved')], 'rating')
            ->orderByDesc('is_featured')->latest()->orderByDesc('id')->get();

        $banners = Banner::query()->where('status', 'active')
            ->where(fn ($query) => $query->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>', now()))
            ->orderBy('sort_order')->orderBy('id')->get();

        $pages = Page::query()->where('status', 'published')
            ->where('published_at', '<=', now())->orderBy('title')->get();

        return response()->json([
            'copy' => (object) DB::table('storefront_copy')->pluck('value', 'key')->all(),
            'categories' => $visibleCategories->map(fn (Category $category): array => [
                'slug' => $category->slug,
                'name' => $category->name,
                'description' => $category->description ?? '',
                'image' => CmsController::imageUrl($category->image_path),
                'tint' => 'peach',
                'mark' => (string) $category->id,
                'parentSlug' => $categoryIndex->get($category->parent_id)?->slug,
            ]),
            'products' => $products->map(function (Product $product) use ($categoryIndex): array {
                $category = $categoryIndex->get($product->category_id);
                $images = $product->images->map(fn (ProductImage $image): array => [
                    'src' => CmsController::imageUrl($image->image_path),
                    'alt' => $image->alt_text ?: $product->name,
                ]);
                $collections = array_values(array_filter([
                    $product->is_featured ? 'trending' : null,
                    $product->is_bestseller ? 'bestseller' : null,
                    $product->created_at?->gte(now()->subDays(30)) ? 'new' : null,
                ]));

                return [
                    'slug' => $product->slug, 'name' => $product->name,
                    'categorySlug' => $category->slug, 'categoryName' => $category->name,
                    'description' => $product->description ?: ($product->short_description ?? ''),
                    'price' => (float) $product->selling_price,
                    ...($product->compare_at_price > $product->selling_price ? ['compareAt' => (float) $product->compare_at_price] : []),
                    'rating' => round((float) $product->approved_rating, 1),
                    'reviewCount' => $product->approved_reviews_count,
                    'image' => $images->first()['src'] ?? '',
                    'images' => $images,
                    'variants' => $product->variants->map(fn (ProductVariant $variant): array => [
                        'id' => $variant->id,
                        'name' => $variant->name ?: $variant->sku,
                        'price' => (float) ($variant->selling_price ?? $product->selling_price),
                    ]),
                    'collections' => $collections,
                ];
            }),
            'banners' => $banners->map(fn (Banner $banner): array => [
                'title' => $banner->title, 'placement' => $banner->placement,
                'image' => CmsController::imageUrl($banner->image_path),
                'href' => preg_match('~^/(?![/\\\\])[^\\\\\s]*$~', $banner->target_url ?? '') ? $banner->target_url : null,
            ]),
            'pages' => $pages->map(fn (Page $page): array => [
                'slug' => $page->slug, 'title' => $page->title, 'content' => $page->content,
                'metaTitle' => $page->meta_title, 'metaDescription' => $page->meta_description,
            ]),
        ])->header('Cache-Control', 'no-store');
    }

    public function media(string $file): StreamedResponse
    {
        $disk = Storage::disk('public');
        $path = 'cms/'.$file;
        abort_unless($disk->exists($path), 404);

        return $disk->response($path, headers: [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

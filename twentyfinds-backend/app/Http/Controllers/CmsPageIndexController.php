<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\View\View;

class CmsPageIndexController extends Controller
{
    public const BUILT_IN = [
        'homepage' => ['Home', '/'],
        'shop' => ['Shop', '/shop'],
        'about' => ['About', '/about'],
        'contact' => ['Contact', '/contact'],
        'faq' => ['FAQs', '/faq'],
        'shipping' => ['Shipping', '/shipping'],
        'returns' => ['Returns', '/returns'],
        'privacy' => ['Privacy Policy', '/privacy'],
        'terms' => ['Terms and Conditions', '/terms'],
        'our-handmade-story' => ['Our Handmade Story', '/pages/our-handmade-story'],
        'personalisation' => ['Personalisation', '/pages/personalisation'],
        'wedding-nikah' => ['Wedding & Nikah', '/pages/wedding-nikah'],
    ];

    public function index(Request $request): View
    {
        $search = $request->string('q')->trim()->limit(120)->toString();
        $type = $request->string('type')->toString();
        $status = $request->string('status')->toString();
        $page = LengthAwarePaginator::resolveCurrentPage();
        $perPage = 20;
        $pages = Page::query()->orderBy('title')->get()->keyBy('slug');
        $categories = Category::query()->orderBy('name')->get(['id', 'name', 'parent_id', 'slug', 'status', 'updated_at']);
        $visibleCategories = Category::visibleCategories()->keyBy('id');
        $products = Product::query()->orderBy('name')->get(['id', 'name', 'slug', 'category_id', 'status', 'updated_at']);

        $builtIn = collect(self::BUILT_IN)->map(function (array $route, string $slug) use ($pages): array {
            $page = $pages->get($slug);
            $hasLiveContent = $this->isPublished($page);
            $contentEditor = $slug === 'shop' ? null : route('cms.edit', $page
                ? ['pages', $page->id]
                : ['pages', 'preset' => $slug]);

            return [
                'title' => $hasLiveContent && $slug !== 'shop' ? $page->title : $route[0],
                'path' => $route[1], 'type' => 'Built-in', 'status' => 'Published',
                'updated' => $page?->updated_at,
                'edit' => route('cms.copy', ['group' => $slug]),
                'contentEdit' => $contentEditor,
            ];
        })->values();

        $custom = $pages->except(array_merge(
            array_diff(array_keys(self::BUILT_IN), ['shop']),
            ['site-announcement', 'site-footer'],
        ))->map(fn (Page $item): array => [
            'title' => $item->title, 'path' => '/pages/'.$item->slug, 'type' => 'Custom page',
            'status' => $this->isPublished($item) ? 'Published' : ucfirst($item->status === 'published' ? 'unpublished' : $item->status),
            'updated' => $item->updated_at, 'edit' => route('cms.edit', ['pages', $item->id]),
        ]);

        $categoryRows = $categories->map(fn (Category $item): array => [
            'title' => $item->name, 'path' => '/categories/'.$item->slug, 'type' => 'Category',
            'status' => $visibleCategories->has($item->id) ? 'Published' : ($item->status === 'draft' ? 'Draft' : 'Hidden'),
            'updated' => $item->updated_at, 'edit' => route('cms.edit', ['categories', $item->id]),
        ]);
        $productRows = $products->map(fn (Product $item): array => [
            'title' => $item->name, 'path' => '/products/'.$item->slug, 'type' => 'Product',
            'status' => $item->status === 'active' && $visibleCategories->has($item->category_id) ? 'Published' : ($item->status === 'draft' ? 'Draft' : 'Hidden'),
            'updated' => $item->updated_at, 'edit' => route('cms.edit', ['products', $item->id]),
        ]);
        $rows = $builtIn->concat($custom)->concat($categoryRows)->concat($productRows)
            ->filter(fn (array $row): bool => ($type === '' || $row['type'] === $type)
                && ($status === '' || $row['status'] === $status)
                && ($search === '' || Str::contains($row['title'].' '.$row['path'], $search, ignoreCase: true)))
            ->values();

        $items = new LengthAwarePaginator($rows->forPage($page, $perPage)->values(), $rows->count(), $perPage, $page, [
            'path' => $request->url(),
            'query' => $request->only(['q', 'type', 'status']),
        ]);

        return view('cms.pages', compact('items', 'search', 'type', 'status'));
    }

    private function isPublished(?Page $page): bool
    {
        return $page?->status === 'published' && $page->published_at?->lte(now());
    }
}

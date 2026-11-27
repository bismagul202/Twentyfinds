<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StorefrontContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $categories = [
                ['home-living', 'Home & Living', '20ish-category-home-living.webp'],
                ['kitchen-dining', 'Kitchen', '20ish-category-kitchen.webp'],
                ['stationery-office', 'Stationery', '20ish-category-stationery.webp'],
                ['travel-lifestyle', 'Travel & Lifestyle', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85'],
                ['fashion-clothing', 'Fashion', '20ish-category-fashion.webp'],
                ['modest-fashion', 'Modest Fashion', 'twentyfinds-category-modest-fashion.webp'],
                ['beauty-accessories', 'Beauty', '20ish-category-beauty.webp'],
                ['handmade-crochet', 'Handmade', 'twentyfinds-category-crochet.webp'],
                ['personalise', 'Personalise', '20ish-personalisation-studio.webp'],
                ['gifts-occasions', 'Gifts & Occasions', '20ish-category-gifts.webp'],
                ['wedding-nikah', 'Wedding & Nikah', '20ish-category-wedding-nikah.webp'],
            ];

            foreach ($categories as $order => [$slug, $name, $image]) {
                Category::withTrashed()->firstOrCreate(['slug' => $slug], [
                    'name' => $name, 'image_path' => str_starts_with($image, 'https://') ? $image : 'storefront/'.$image,
                    'status' => 'active', 'sort_order' => ($order + 1) * 10,
                ]);
            }

            $banners = [
                'homepage' => ['Good taste.', '20ish-hero-banner.webp'],
                'site-logo' => ['20ISH logo', 'logo-transparent.webp'],
                'shop' => ['Shop All', 'twentyfinds-hero-departments.webp'],
                'new-in' => ['New In', '20ish-new-in-editorial.webp'],
                'about' => ['About 20ISH', '20ish-about-everyday-edit.webp'],
                'about-fashion' => ['About fashion image', '20ish-category-fashion.webp'],
                'about-stationery' => ['About stationery image', '20ish-category-stationery.webp'],
                'contact' => ['Contact', '20ish-contact-editorial.webp'],
                'studio-handmade' => ['Handmade Studio', 'twentyfinds-category-crochet.webp'],
                'studio-personalise' => ['Personalisation Studio', '20ish-personalisation-studio.webp'],
                'studio-wedding-nikah' => ['Wedding & Nikah', '20ish-wedding-nikah.webp'],
                'budget-10' => ['Gifts under £10', 'twentyfinds-hero-wide.webp'],
                'our-handmade-story' => ['Our Handmade Story', 'twentyfinds-category-crochet.webp'],
                'personalisation' => ['Personalisation', '20ish-personalisation-studio.webp'],
                'wedding-nikah' => ['Wedding & Nikah', '20ish-wedding-nikah.webp'],
            ];

            foreach ($banners as $placement => [$title, $image]) {
                if ($placement === 'homepage' && Banner::withTrashed()->where('placement', 'hero')->exists()) {
                    continue;
                }

                Banner::withTrashed()->firstOrCreate(['placement' => $placement], [
                    'title' => $title, 'image_path' => 'storefront/'.$image,
                    'status' => 'active', 'sort_order' => 0,
                ]);
            }
        });
    }
}

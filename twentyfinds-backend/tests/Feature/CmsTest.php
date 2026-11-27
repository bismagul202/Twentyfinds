<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\StorefrontContentSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class CmsTest extends TestCase
{
    public function test_dashboard_requires_sign_in(): void
    {
        $this->get('/admin/products')->assertRedirect('/admin/login');
        $this->get('/admin/login')->assertRedirect('/admin');
        $this->get('/admin')->assertOk()->assertSee('Owner sign in');
        $this->getJson('/admin/overview-data')->assertUnauthorized();
    }

    public function test_owner_uploads_and_publishes_storefront_content(): void
    {
        if (getenv('CMS_TEST_MYSQL') !== '1') {
            $this->markTestSkipped('Set CMS_TEST_MYSQL=1 to run against a migrated MySQL database with rollback.');
        }

        $database = getenv('DB_DATABASE');
        $this->assertNotEmpty($database, 'Set DB_DATABASE to the migrated MySQL database for this integration test.');
        config(['database.default' => 'mysql', 'database.connections.mysql.database' => $database]);
        DB::beginTransaction();
        Storage::fake('public');

        try {
            $suffix = Str::lower(Str::random(12));
            $customer = User::factory()->create();
            $this->actingAs($customer)->get('/admin')->assertForbidden();
            $this->getJson('/admin/overview-data')->assertForbidden();

            $owner = User::factory()->create(['password' => 'Test-only-password-2026']);
            $owner->roles()->attach(Role::query()->firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']));
            $this->post('/admin/login', ['email' => $owner->email, 'password' => 'Test-only-password-2026'])
                ->assertSessionHasNoErrors()->assertRedirect('/admin');
            $this->assertAuthenticatedAs($owner);
            $this->get('/admin/pages')->assertOk()->assertSee('/shop')->assertSee('/privacy')->assertSee('Edit wording');
            $this->get('/admin/pages/edit?preset=about')->assertOk()->assertSee('value="about"', false);
            $this->get('/admin')->assertOk()->assertViewIs('cms.dashboard')->assertSee('Quick actions');
            $this->getJson('/admin/overview-data')->assertOk()
                ->assertJsonStructure(['sections' => ['products', 'categories', 'banners', 'pages'], 'recent']);
            $this->get('/admin/products/edit')->assertOk()->assertSee('Add product photos')
                ->assertSee('New Arrivals')->assertSee('Trending Finds');

            $this->get('/admin/storefront-copy?group=homepage')->assertOk()->assertSee('Good taste.');
            $this->post('/admin/storefront-copy', [
                'group' => 'homepage', 'copy' => ['homepage.good-taste' => 'A new storefront headline'],
            ])->assertSessionHasNoErrors()->assertRedirect();
            $this->getJson('/api/storefront')->assertOk()->assertJsonFragment([
                'homepage.good-taste' => 'A new storefront headline',
            ]);
            $this->post('/admin/storefront-copy', [
                'group' => 'homepage', 'copy' => ['footer.link-faq' => 'Other section'],
            ])->assertSessionHasErrors('copy');
            $this->post('/admin/storefront-copy', [
                'group' => 'header', 'copy' => ['header.wishlist-wishlistcount-saved' => 'Removed the count'],
            ])->assertSessionHasErrors('copy');
            $this->post('/admin/storefront-copy', [
                'group' => 'homepage', 'copy' => ['homepage.good-taste' => ''],
            ])->assertSessionHasNoErrors()->assertRedirect();
            $this->getJson('/api/storefront')->assertJsonMissing(['homepage.good-taste' => 'A new storefront headline']);

            $this->post('/admin/categories/edit', [
                'name' => 'CMS category', 'slug' => $categorySlug = 'cms-category-'.$suffix,
                'status' => 'active', 'sort_order' => 0,
            ])->assertSessionHasNoErrors()->assertRedirect();
            $category = Category::query()->where('slug', $categorySlug)->sole();

            $product = [
                'name' => 'CMS find', 'slug' => $productSlug = 'cms-find-'.$suffix, 'sku' => 'CMS-'.$suffix,
                'status' => 'draft', 'category_id' => $category->id,
                'selling_price' => '20.00', 'description' => 'Uploaded from the owner dashboard',
            ];
            $this->post('/admin/products/edit', $product)->assertSessionHasErrors('selling_price');
            $product['selling_price'] = '12.50';
            $product['compare_at_price'] = '17.99';
            $this->post('/admin/products/edit', $product + ['images' => [$this->photo()]])
                ->assertSessionHasNoErrors()->assertRedirect();
            $record = $category->products()->where('slug', $productSlug)->sole();
            $this->get('/admin/products/edit/'.$record->id)->assertOk()->assertSee('Set primary');
            $this->getJson('/api/storefront')->assertJsonMissing(['slug' => $productSlug]);

            $this->seed(StorefrontContentSeeder::class);
            $imported = Category::withTrashed()->where('slug', 'home-living')->firstOrFail();
            $imported->update(['name' => 'Home edit', 'status' => 'draft']);
            $this->seed(StorefrontContentSeeder::class);
            $this->assertDatabaseHas('categories', ['id' => $imported->id, 'name' => 'Home edit', 'status' => 'draft']);
            $this->getJson('/api/storefront')->assertOk()
                ->assertJsonMissing(['slug' => 'home-living'])
                ->assertJsonFragment(['homepage.good-taste' => 'Good taste.']);

            $product['status'] = 'active';
            $this->post('/admin/products/edit/'.$record->id, $product)->assertSessionHasNoErrors();
            $collections = fn (): array => collect($this->getJson('/api/storefront')->assertOk()->json('products'))
                ->firstWhere('slug', $productSlug)['collections'];
            $this->assertSame([], $collections());

            $this->post('/admin/products/edit/'.$record->id, $product + ['is_new_arrival' => 1, 'is_featured' => 0])
                ->assertSessionHasNoErrors();
            $this->assertSame(['new'], $collections());

            $this->post('/admin/products/edit/'.$record->id, $product + ['is_new_arrival' => 0, 'is_featured' => 1])
                ->assertSessionHasNoErrors();
            $this->assertSame(['trending'], $collections());

            $this->post('/admin/products/'.$record->id.'/variants', [
                'variant_name' => 'Burgundy', 'variant_sku' => 'VAR-'.$suffix,
                'variant_price' => '13.50', 'variant_active' => 1, 'variant_default' => 1,
            ])->assertSessionHasNoErrors()->assertRedirect();
            $this->getJson('/admin/overview-data')->assertOk()->assertJsonFragment([
                'title' => 'CMS find',
                'href' => '/admin/products/edit/'.$record->id,
            ]);
            $image = $record->images()->sole();
            Storage::disk('public')->assertExists($image->image_path);
            $this->get('/api/media/'.basename($image->image_path))->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');

            $this->post('/admin/pages/edit', [
                'title' => 'CMS information', 'slug' => $pageSlug = 'cms-info-'.$suffix,
                'status' => 'published', 'content' => 'Published information',
            ])->assertSessionHasNoErrors()->assertRedirect();

            $this->post('/admin/banners/edit', [
                'title' => $bannerTitle = 'CMS campaign '.$suffix, 'placement' => 'homepage',
                'status' => 'active', 'sort_order' => 0, 'image' => $this->photo(),
                'target_url' => '/shop?sort=new',
            ])->assertSessionHasNoErrors()->assertRedirect();

            $this->getJson('/api/storefront')->assertOk()->assertJsonFragment([
                'slug' => $productSlug, 'price' => 12.5, 'compareAt' => 17.99,
            ])->assertJsonFragment([
                'name' => 'Burgundy', 'price' => 13.5,
            ])->assertJsonFragment([
                'slug' => $pageSlug, 'content' => 'Published information',
            ])->assertJsonFragment([
                'title' => $bannerTitle, 'href' => '/shop?sort=new',
            ])->assertJsonMissingPath('products.0.purchase_cost');

            $this->get('/admin/pages?q='.$productSlug.'&type=Product&status=Published')
                ->assertOk()->assertSee('/products/'.$productSlug)->assertDontSee('/categories/'.$categorySlug);
            $this->get('/admin/pages?q='.$pageSlug)->assertOk()->assertSee('/pages/'.$pageSlug);

            $category->update(['status' => 'draft']);
            $this->get('/admin/pages?q='.$productSlug.'&status=Hidden')->assertOk()->assertSee('/products/'.$productSlug);
            $this->getJson('/api/storefront')->assertJsonMissing(['slug' => $productSlug]);

            $category->update(['status' => 'active']);
            $this->get('/admin/products?q='.urlencode($record->name))->assertOk()
                ->assertSee('Actions for '.$record->name)->assertSee('Duplicate')->assertSee('SEO')->assertSee('Delete '.$record->name);
            $this->get('/admin/products/'.$record->id.'/seo')->assertOk()->assertSee('Search title');
            $this->patch('/admin/products/'.$record->id.'/seo', [
                'meta_title' => 'Product search title', 'meta_description' => 'Product search description',
            ])->assertSessionHasNoErrors()->assertRedirect();
            $this->patch('/admin/categories/'.$category->id.'/seo', [
                'meta_title' => 'Category search title', 'meta_description' => 'Category search description',
            ])->assertSessionHasNoErrors()->assertRedirect();
            $this->getJson('/api/storefront')->assertOk()
                ->assertJsonFragment(['slug' => $productSlug, 'metaTitle' => 'Product search title'])
                ->assertJsonFragment(['slug' => $categorySlug, 'metaDescription' => 'Category search description']);

            $this->post('/admin/products/'.$record->id.'/duplicate')->assertRedirect();
            $copy = $category->products()->where('slug', 'like', $productSlug.'-copy-%')->sole();
            $this->assertSame('draft', $copy->status);
            $this->assertNotSame($record->sku, $copy->sku);
            $this->assertSame($record->images()->sole()->image_path, $copy->images()->sole()->image_path);
            $this->assertNotSame($record->variants()->sole()->sku, $copy->variants()->sole()->sku);
            $this->getJson('/api/storefront')->assertJsonMissing(['slug' => $copy->slug]);
            $this->delete('/admin/products/'.$copy->id)->assertRedirect('/admin/products');
            $this->post('/admin/categories/'.$category->id.'/duplicate')->assertRedirect();
            $categoryCopy = Category::query()->where('slug', 'like', $categorySlug.'-copy-%')->sole();
            $this->assertSame('draft', $categoryCopy->status);
            $this->assertSame(0, $categoryCopy->products()->count());
            $this->get('/admin/products/'.$record->id.'/delete')->assertOk()->assertSee($record->name);
            $this->delete('/admin/categories/'.$category->id)->assertSessionHasErrors('category');
            $this->delete('/admin/products/'.$record->id)->assertRedirect('/admin/products');
            $this->assertSoftDeleted($record);
            $this->get('/admin/products/edit/'.$record->id)->assertNotFound();
            $this->getJson('/api/storefront')->assertJsonMissing(['slug' => $productSlug]);
            $this->delete('/admin/categories/'.$category->id)->assertRedirect('/admin/categories');
            $this->assertSoftDeleted($category);
            $this->getJson('/api/storefront')->assertJsonMissing(['slug' => $categorySlug]);
        } finally {
            DB::rollBack();
        }
    }

    private function photo(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('test.png', base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jHrkAAAAASUVORK5CYII=',
        ));
    }
}

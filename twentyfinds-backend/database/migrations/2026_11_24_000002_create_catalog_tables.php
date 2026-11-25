<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->string('status', 20)->default('active');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['parent_id', 'status', 'sort_order']);
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->longText('description')->nullable();
            $table->text('short_description')->nullable();
            $table->decimal('purchase_cost', 10, 2)->unsigned()->default(0);
            $table->decimal('selling_price', 10, 2);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_bestseller')->default(false);
            $table->string('status', 20)->default('draft');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['category_id', 'status']);
            $table->index(['is_featured', 'status']);
            $table->index(['is_bestseller', 'status']);
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->string('alt_text')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['product_id', 'sort_order']);
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->string('sku')->unique();
            $table->json('options')->nullable();
            $table->decimal('purchase_cost', 10, 2)->unsigned()->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['product_id', 'is_active']);
        });

        DB::statement(
            'ALTER TABLE `products` ADD CONSTRAINT `products_selling_price_range_chk` '.
            'CHECK (`selling_price` >= 0.01 AND `selling_price` <= 19.99)'
        );
        DB::statement(
            'ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_selling_price_range_chk` '.
            'CHECK (`selling_price` IS NULL OR (`selling_price` >= 0.01 AND `selling_price` <= 19.99))'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};

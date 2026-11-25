<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('carts')) {
            Schema::create('carts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->string('session_token', 100)->nullable()->unique();
                $table->string('status', 20)->default('active');
                $table->timestamps();
                $table->softDeletes();
                $table->index(['user_id', 'status']);
            });
        }

        if (! Schema::hasTable('cart_items')) {
            Schema::create('cart_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_variant_id')->constrained()->restrictOnDelete();
                $table->unsignedInteger('quantity')->default(1);
                $table->decimal('unit_price', 10, 2);
                $table->timestamps();
                $table->unique(['cart_id', 'product_variant_id']);
            });
        }

        if (! Schema::hasTable('wishlists')) {
            Schema::create('wishlists', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('name')->default('Wishlist');
                $table->boolean('is_default')->default(false);
                $table->timestamps();
                $table->softDeletes();
                $table->index(['user_id', 'is_default']);
            });
        }

        if (! Schema::hasTable('wishlist_items')) {
            Schema::create('wishlist_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('wishlist_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_variant_id')->constrained()->restrictOnDelete();
                $table->timestamps();
                $table->unique(['wishlist_id', 'product_variant_id']);
            });
        }

        foreach ([
            'cart_items_unit_price_range_chk' => '`unit_price` >= 0.01 AND `unit_price` <= 19.99',
            'cart_items_quantity_positive_chk' => '`quantity` > 0',
        ] as $name => $expression) {
            $checkExists = DB::table('information_schema.table_constraints')
                ->where('constraint_schema', DB::connection()->getDatabaseName())
                ->where('table_name', 'cart_items')
                ->where('constraint_name', $name)
                ->exists();

            if (! $checkExists) {
                DB::statement("ALTER TABLE `cart_items` ADD CONSTRAINT `{$name}` CHECK ({$expression})");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlist_items');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
    }
};

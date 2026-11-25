<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('discount_type', 20);
            $table->decimal('discount_value', 10, 2)->unsigned();
            $table->decimal('minimum_subtotal', 10, 2)->unsigned()->default(0);
            $table->decimal('maximum_discount', 10, 2)->unsigned()->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('per_customer_limit')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['is_active', 'starts_at', 'ends_at']);
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('customer_address_id')->nullable()->constrained('customer_addresses')->nullOnDelete();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 30)->default('pending');
            $table->string('payment_method', 30)->nullable();
            $table->string('payment_status', 30)->default('pending');
            $table->char('currency', 3)->default('GBP');
            $table->decimal('subtotal', 10, 2)->unsigned();
            $table->decimal('shipping_amount', 10, 2)->unsigned()->default(0);
            $table->decimal('discount_amount', 10, 2)->unsigned()->default(0);
            $table->decimal('total_amount', 10, 2)->unsigned();
            $table->string('delivery_full_name');
            $table->string('delivery_phone', 32);
            $table->string('delivery_address_line_1');
            $table->string('delivery_address_line_2')->nullable();
            $table->string('delivery_city');
            $table->string('delivery_county')->nullable();
            $table->string('delivery_postcode', 20);
            $table->char('delivery_country', 2)->default('GB');
            $table->text('customer_note')->nullable();
            $table->timestamps();
            $table->index(['customer_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index('payment_status');
            $table->index(['coupon_id', 'customer_id']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('sku');
            $table->json('variant_options')->nullable();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 10, 2)->unsigned();
            $table->timestamps();
            $table->index('sku');
        });

        DB::statement(
            'ALTER TABLE `coupons` ADD CONSTRAINT `coupons_discount_value_chk` '.
            'CHECK (`discount_value` > 0 AND '.
            '((`discount_type` = \'percentage\' AND `discount_value` <= 100) OR '.
            '(`discount_type` = \'fixed\' AND `discount_value` > 0)))'
        );
        DB::statement(
            'ALTER TABLE `order_items` ADD CONSTRAINT `order_items_unit_price_range_chk` '.
            'CHECK (`unit_price` >= 0.01 AND `unit_price` <= 19.99)'
        );
        DB::statement(
            'ALTER TABLE `order_items` ADD CONSTRAINT `order_items_quantity_positive_chk` CHECK (`quantity` > 0)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('coupons');
    }
};

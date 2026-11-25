<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 10, 2)->unsigned();
            $table->char('currency', 3)->default('GBP');
            $table->string('method', 30);
            $table->string('provider')->nullable();
            $table->string('transaction_reference')->nullable()->unique();
            $table->string('status', 30)->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['order_id', 'status']);
        });

        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->string('courier_name')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('status', 30)->default('pending');
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->index(['courier_name', 'tracking_number']);
            $table->index(['order_id', 'status']);
        });

        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_item_id')->constrained()->restrictOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('quantity');
            $table->string('status', 30)->default('requested');
            $table->text('reason')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamps();
            $table->index(['order_id', 'status']);
            $table->index(['customer_id', 'created_at']);
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('return_id')->nullable()->constrained('returns')->restrictOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->restrictOnDelete();
            $table->decimal('amount', 10, 2)->unsigned();
            $table->char('currency', 3)->default('GBP');
            $table->string('status', 30)->default('pending');
            $table->string('transaction_reference')->nullable()->unique();
            $table->text('reason')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['order_id', 'status']);
        });

        DB::statement(
            'ALTER TABLE `returns` ADD CONSTRAINT `returns_quantity_positive_chk` CHECK (`quantity` > 0)'
        );
        DB::statement(
            'ALTER TABLE `refunds` ADD CONSTRAINT `refunds_amount_positive_chk` CHECK (`amount` > 0)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('returns');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('payments');
    }
};

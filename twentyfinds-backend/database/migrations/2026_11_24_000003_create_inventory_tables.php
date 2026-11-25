<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('inventory')) {
            Schema::create('inventory', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_variant_id');
                $table->unsignedInteger('available_quantity')->default(0);
                $table->unsignedInteger('reorder_level')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasIndex('inventory', ['product_variant_id'], 'unique')) {
            Schema::table('inventory', function (Blueprint $table) {
                $table->unique('product_variant_id');
            });
        }

        if (! Schema::hasForeignKey('inventory', ['product_variant_id'])) {
            Schema::table('inventory', function (Blueprint $table) {
                $table->foreign('product_variant_id')
                    ->references('id')
                    ->on('product_variants')
                    ->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('inventory_transactions')) {
            Schema::create('inventory_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('inventory_id');
                $table->foreignId('performed_by')->nullable();
                $table->string('transaction_type', 20);
                $table->integer('quantity_change');
                $table->text('reason')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasForeignKey('inventory_transactions', ['inventory_id'])) {
            Schema::table('inventory_transactions', function (Blueprint $table) {
                $table->foreign('inventory_id')
                    ->references('id')
                    ->on('inventory')
                    ->restrictOnDelete();
            });
        }

        if (! Schema::hasForeignKey('inventory_transactions', ['performed_by'])) {
            Schema::table('inventory_transactions', function (Blueprint $table) {
                $table->foreign('performed_by')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasIndex('inventory_transactions', ['inventory_id', 'created_at'])) {
            Schema::table('inventory_transactions', function (Blueprint $table) {
                $table->index(['inventory_id', 'created_at']);
            });
        }

        if (! Schema::hasIndex('inventory_transactions', ['performed_by', 'created_at'])) {
            Schema::table('inventory_transactions', function (Blueprint $table) {
                $table->index(['performed_by', 'created_at']);
            });
        }

        $checkExists = DB::table('information_schema.table_constraints')
            ->where('constraint_schema', DB::connection()->getDatabaseName())
            ->where('table_name', 'inventory_transactions')
            ->where('constraint_name', 'inventory_transactions_quantity_change_chk')
            ->exists();

        if (! $checkExists) {
            DB::statement(
                'ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_quantity_change_chk` '.
                'CHECK (`quantity_change` <> 0 AND '.
                '(`transaction_type` = \'adjustment\' OR '.
                '(`transaction_type` = \'addition\' AND `quantity_change` > 0) OR '.
                '(`transaction_type` = \'reduction\' AND `quantity_change` < 0)))'
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory');
    }
};

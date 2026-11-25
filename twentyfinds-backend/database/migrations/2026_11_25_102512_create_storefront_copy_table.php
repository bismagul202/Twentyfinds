<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storefront_copy', function (Blueprint $table): void {
            $table->string('key', 150)->primary();
            $table->text('value');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storefront_copy');
    }
};

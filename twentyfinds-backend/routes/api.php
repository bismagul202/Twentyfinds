<?php

use App\Http\Controllers\ContactSubmissionController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']))
    ->name('health');
Route::get('/storefront', StorefrontController::class)->name('storefront');
Route::get('/media/{file}', [StorefrontController::class, 'media'])
    ->where('file', '[A-Za-z0-9]{40}\.(?:jpe?g|png|webp)')
    ->name('cms.media');

Route::post('/contact', [ContactSubmissionController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');

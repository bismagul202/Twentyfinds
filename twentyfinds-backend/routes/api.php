<?php

use App\Http\Controllers\CheckoutController;
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

Route::get('/checkout', [CheckoutController::class, 'options']);
Route::post('/checkout', [CheckoutController::class, 'store'])->middleware('throttle:10,1');
Route::get('/checkout/{token}', [CheckoutController::class, 'show'])->whereUuid('token')->middleware('throttle:90,1');
Route::post('/checkout/{token}/cancel', [CheckoutController::class, 'cancel'])->whereUuid('token')->middleware('throttle:10,1');
Route::post('/payments/stripe/webhook', [CheckoutController::class, 'webhook']);

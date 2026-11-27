<?php

use App\Http\Controllers\CmsController;
use App\Http\Controllers\CmsOrderController;
use App\Http\Controllers\CmsPageIndexController;
use App\Http\Controllers\CmsSessionController;
use App\Http\Controllers\ContactSubmissionController;
use App\Http\Controllers\StorefrontCopyController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('admin')->group(function (): void {
    Route::get('/', [CmsController::class, 'dashboard'])->name('cms.index');
    Route::get('/login', fn () => to_route('cms.index'))->name('login');
    Route::post('/login', [CmsSessionController::class, 'store'])->middleware('throttle:6,1')->name('cms.login');
    Route::post('/logout', [CmsSessionController::class, 'destroy'])->middleware('auth')->name('cms.logout');

    Route::middleware(['auth', 'can:manage-cms'])->name('cms.')->group(function (): void {
        Route::get('/orders', [CmsOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [CmsOrderController::class, 'show'])->whereNumber('order')->name('orders.show');
        Route::patch('/orders/{order}/status', [CmsOrderController::class, 'updateStatus'])->whereNumber('order')->name('orders.status');
        Route::post('/orders/{order}/cash-received', [CmsOrderController::class, 'cashReceived'])->whereNumber('order')->name('orders.cash');
        Route::get('/overview-data', [CmsController::class, 'overview'])->name('overview.data');
        Route::get('/storefront-copy', [StorefrontCopyController::class, 'edit'])->name('copy');
        Route::post('/storefront-copy', [StorefrontCopyController::class, 'update'])->name('copy.update');
        Route::get('/contact-inbox', [ContactSubmissionController::class, 'index'])->name('contact.index');
        Route::get('/contact-inbox/{submission}', [ContactSubmissionController::class, 'show'])->whereNumber('submission')->name('contact.show');
        Route::get('/pages', [CmsPageIndexController::class, 'index'])->name('pages');
        Route::get('/{section}', [CmsController::class, 'index'])
            ->whereIn('section', ['products', 'categories', 'banners'])->name('section');
        Route::get('/{section}/edit/{id?}', [CmsController::class, 'edit'])
            ->whereIn('section', array_keys(CmsController::SECTIONS))->whereNumber('id')->name('edit');
        Route::post('/{section}/edit/{id?}', [CmsController::class, 'save'])
            ->whereIn('section', array_keys(CmsController::SECTIONS))->whereNumber('id')->name('save');
        Route::get('/{section}/{id}/delete', [CmsController::class, 'confirmDelete'])
            ->whereIn('section', ['products', 'categories'])->whereNumber('id')->name('confirm-delete');
        Route::delete('/{section}/{id}', [CmsController::class, 'destroy'])
            ->whereIn('section', ['products', 'categories'])->whereNumber('id')->name('destroy');
        Route::post('/{section}/{id}/duplicate', [CmsController::class, 'duplicate'])
            ->whereIn('section', ['products', 'categories'])->whereNumber('id')->name('duplicate');
        Route::get('/{section}/{id}/seo', [CmsController::class, 'seo'])
            ->whereIn('section', ['products', 'categories'])->whereNumber('id')->name('seo');
        Route::patch('/{section}/{id}/seo', [CmsController::class, 'saveSeo'])
            ->whereIn('section', ['products', 'categories'])->whereNumber('id')->name('seo.save');
        Route::post('/products/{product}/variants/{variant?}', [CmsController::class, 'variant'])
            ->whereNumber(['product', 'variant'])->name('variant');
        Route::post('/products/{product}/images/{image}/{action}', [CmsController::class, 'image'])
            ->whereNumber(['product', 'image'])->whereIn('action', ['primary', 'remove'])->name('image');
    });
});

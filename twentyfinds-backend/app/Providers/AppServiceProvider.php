<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $publicUrl = config('app.url');
        $publicScheme = is_string($publicUrl) ? parse_url($publicUrl, PHP_URL_SCHEME) : null;

        if (in_array($publicScheme, ['http', 'https'], true)) {
            URL::useOrigin($publicUrl);
            URL::forceScheme($publicScheme);
        }

        Gate::define('manage-cms', fn (User $user): bool => $user->roles()
            ->where('slug', 'admin')->exists());
    }
}

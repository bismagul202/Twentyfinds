<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$askOwnerPassword = function (Command $command, bool $interactive): ?string {
    if (! $interactive) {
        $command->error('Run this command interactively to enter the password securely.');

        return null;
    }

    $password = $command->secret('Password (at least 12 characters)', false);
    if (! is_string($password) || strlen($password) < 12 || strlen($password) > 72) {
        $command->error('Use a password from 12 to 72 bytes.');

        return null;
    }

    if ($password !== $command->secret('Confirm password', false)) {
        $command->error('Passwords do not match.');

        return null;
    }

    return $password;
};

Artisan::command('cms:create-owner {email}', function () use ($askOwnerPassword): int {
    $email = str($this->argument('email'))->trim()->lower()->toString();
    $validator = Validator::make(['email' => $email], [
        'email' => ['required', 'email', 'max:255', 'unique:users,email'],
    ]);
    if ($validator->fails()) {
        $this->error($validator->errors()->first());

        return 1;
    }

    $password = $askOwnerPassword($this, $this->input->isInteractive());
    if ($password === null) {
        return 1;
    }

    DB::transaction(function () use ($email, $password): void {
        $role = Role::query()->firstOrCreate(['slug' => 'admin'], [
            'name' => 'Admin', 'description' => 'Store administration',
        ]);
        $user = User::query()->create(['name' => 'Store owner', 'email' => $email, 'password' => $password]);
        $user->roles()->attach($role);
    });

    $this->info('CMS owner account created.');

    return 0;
})->purpose('Create a password-protected CMS owner account');

Artisan::command('cms:reset-owner-password {email}', function () use ($askOwnerPassword): int {
    $email = str($this->argument('email'))->trim()->lower()->toString();
    $owner = User::query()->where('email', $email)
        ->whereHas('roles', fn ($query) => $query->where('slug', 'admin'))->first();

    if ($owner === null) {
        $this->error('No owner account exists for that email.');

        return 1;
    }

    $password = $askOwnerPassword($this, $this->input->isInteractive());
    if ($password === null) {
        return 1;
    }

    $owner->forceFill(['password' => $password, 'remember_token' => null])->save();
    $this->info('Owner password updated.');

    return 0;
})->purpose('Reset a CMS owner password from a private terminal prompt');

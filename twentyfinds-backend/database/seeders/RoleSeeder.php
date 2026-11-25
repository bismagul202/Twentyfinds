<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Store administration'],
            ['name' => 'Customer', 'slug' => 'customer', 'description' => 'Store customer'],
            ['name' => 'Fulfilment Staff', 'slug' => 'fulfilment-staff', 'description' => 'Order fulfilment staff'],
        ] as $role) {
            Role::query()->updateOrCreate(
                ['slug' => $role['slug']],
                ['name' => $role['name'], 'description' => $role['description']]
            );
        }
    }
}

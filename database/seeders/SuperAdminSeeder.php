<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $username = env('SUPER_ADMIN_USERNAME', 'jose-the-super-admin');
        $password = env('SUPER_ADMIN_PASSWORD');
        $email    = env('SUPER_ADMIN_EMAIL', 'devikaupendranr@gmail.com');

        if (empty($password)) {
            $this->command?->error('SUPER_ADMIN_PASSWORD is not set in .env!');
            return;
        }

        $superAdmin = Admin::updateOrCreate(
            ['username' => $username],
            [
                'email'    => $email,
                'password' => Hash::make($password),
                'role'     => 'super_admin',
                'status'   => 'active',
            ]
        );

        // Also ensure default staff admin has role = 'staff'
        Admin::where('username', '!=', $username)->whereNull('role')->update(['role' => 'staff']);

        $this->command?->info("Super Admin account seeded successfully!");
        $this->command?->line("Username: {$superAdmin->username}");
        $this->command?->line("Role:     {$superAdmin->role}");
    }
}


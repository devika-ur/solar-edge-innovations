<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $username = env('ADMIN_DEFAULT_USER', 'admin');
        $email    = env('ADMIN_DEFAULT_EMAIL', 'admin@solaredgeinnovation.in');
        $password = env('ADMIN_DEFAULT_PASSWORD', 'SolarEdge@2026!');

        Admin::updateOrCreate(
            ['username' => $username],
            [
                'email'    => $email,
                'password' => Hash::make($password),
                'status'   => 'active',
            ]
        );

        $this->command?->info("Admin account seeded successfully!");
        $this->command?->line("Username: {$username}");
        $this->command?->line("Email:    {$email}");
    }
}

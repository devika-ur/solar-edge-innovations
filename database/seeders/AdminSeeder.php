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
        // Set admin credentials directly here
        $username = 'admin';
        $email    = 'admin@solaredgeinnovation.in';
        $password = 'SolarEdge@2026!';

        Admin::updateOrCreate(
            ['username' => $username],
            [
                'email'    => $email,
                'password' => Hash::make($password),
                'status'   => 'active',
            ]
        );

        $this->command->info("Admin account seeded successfully!");
        $this->command->line("Username: {$username}");
        $this->command->line("Email:    {$email}");
        $this->command->line("Password: {$password}");
    }
}

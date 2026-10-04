<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('admin:set {username=admin} {password=SolarEdge@2026!} {email=admin@solaredgeinnovation.in}', function ($username, $password, $email) {
    $admin = \App\Models\Admin::first();
    if (!$admin) {
        $admin = new \App\Models\Admin();
    }
    $admin->username = $username;
    $admin->email = $email;
    $admin->password = \Illuminate\Support\Facades\Hash::make($password);
    $admin->status = 'active';
    $admin->save();

    $this->info("Admin account updated successfully!");
    $this->line("Username: {$username}");
    $this->line("Email:    {$email}");
    $this->line("Password: {$password}");
})->purpose('Set or update the admin username and password');

Artisan::command('uploads:link', function () {
    $source = public_path('uploads');
    $target = base_path('../public_html/uploads');

    if (!file_exists($source)) {
        mkdir($source, 0755, true);
    }

    if (is_dir(base_path('../public_html'))) {
        if (!file_exists($target)) {
            @symlink($source, $target);
            $this->info("Symlink created: public_html/uploads -> laravel-core/public/uploads");
        } else {
            // Copy any files across
            if (is_dir($source . '/projects')) {
                if (!is_dir($target . '/projects')) {
                    @mkdir($target . '/projects', 0755, true);
                }
                foreach (glob($source . '/projects/*') as $f) {
                    @copy($f, $target . '/projects/' . basename($f));
                }
            }
            $this->info("Uploads synced to public_html/uploads");
        }
    } else {
        $this->info("public_html not detected (running locally).");
    }
})->purpose('Link or sync uploads to public_html');


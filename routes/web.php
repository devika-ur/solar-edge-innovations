<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Single Page Application Blade Layout
|--------------------------------------------------------------------------
| All public and admin frontend routes are served by the app Blade layout,
| allowing the React Router to handle client-side view navigation while
| retaining full Laravel session state, SEO meta tags, and assets.
*/

// Serve uploaded project images safely even across split public_html directories
Route::get('/uploads/projects/{filename}', function ($filename) {
    $candidates = [
        public_path('uploads/projects/' . $filename),
        base_path('public/uploads/projects/' . $filename),
        base_path('../public_html/uploads/projects/' . $filename),
    ];

    foreach ($candidates as $candidate) {
        if (file_exists($candidate)) {
            return response()->file($candidate);
        }
    }

    abort(404);
})->where('filename', '.*');

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|storage|uploads|brochures|assets|build|up).*$');

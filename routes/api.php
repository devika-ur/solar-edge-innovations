<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Api\Admin\InquiryController as AdminInquiryController;
use App\Http\Controllers\Api\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Api\Admin\StatsController as AdminStatsController;
use App\Http\Controllers\Api\Admin\TokenController as AdminTokenController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SetupController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/

// Public Projects
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects.php', [ProjectController::class, 'index']);

// Public FAQs
Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/faqs.php', [FaqController::class, 'index']);

// Public Contact Form
Route::post('/contact', [ContactController::class, 'send']);
Route::post('/contact.php', [ContactController::class, 'send']);

// Database Health / Setup
Route::get('/setup', [SetupController::class, 'check']);
Route::get('/setup-database.php', [SetupController::class, 'check']);
Route::post('/setup', [SetupController::class, 'initialize']);

/*
|--------------------------------------------------------------------------
| Admin Authentication Routes
|--------------------------------------------------------------------------
*/

Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/admin-login.php', [AdminAuthController::class, 'login']);

Route::get('/admin/verify', [AdminAuthController::class, 'verify']);
Route::get('/admin-verify.php', [AdminAuthController::class, 'verify']);

Route::match(['get', 'post'], '/admin/logout', [AdminAuthController::class, 'logout']);
Route::match(['get', 'post'], '/admin-logout.php', [AdminAuthController::class, 'logout']);

/*
|--------------------------------------------------------------------------
| Admin Protected Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware('admin.session')->group(function () {
    // Stats & Health
    Route::get('/admin/stats', [AdminStatsController::class, 'index']);
    Route::get('/admin-stats.php', [AdminStatsController::class, 'index']);

    // Project Management
    Route::get('/admin/projects', [AdminProjectController::class, 'index']);
    Route::get('/admin-projects.php', [AdminProjectController::class, 'index']);
    Route::post('/admin/projects', [AdminProjectController::class, 'handle']);
    Route::post('/admin-projects.php', [AdminProjectController::class, 'handle']);

    // FAQ Management
    Route::get('/admin/faqs', [AdminFaqController::class, 'index']);
    Route::get('/admin-faqs.php', [AdminFaqController::class, 'index']);
    Route::post('/admin/faqs', [AdminFaqController::class, 'handle']);
    Route::post('/admin-faqs.php', [AdminFaqController::class, 'handle']);

    // Contact Inquiries Management
    Route::get('/admin/inquiries', [AdminInquiryController::class, 'index']);
    Route::get('/admin-inquiries.php', [AdminInquiryController::class, 'index']);
    Route::post('/admin/inquiries', [AdminInquiryController::class, 'handle']);
    Route::post('/admin-inquiries.php', [AdminInquiryController::class, 'handle']);

    // Token Management
    Route::get('/admin/tokens', [AdminTokenController::class, 'index']);
    Route::get('/admin-tokens.php', [AdminTokenController::class, 'index']);
    Route::post('/admin/tokens', [AdminTokenController::class, 'handle']);
    Route::post('/admin-tokens.php', [AdminTokenController::class, 'handle']);

    // Admin Setup
    Route::get('/admin/setup', [SetupController::class, 'check']);
    Route::get('/admin-setup.php', [SetupController::class, 'check']);
    Route::post('/admin/setup', [SetupController::class, 'initialize']);
    Route::post('/admin-setup.php', [SetupController::class, 'initialize']);
});

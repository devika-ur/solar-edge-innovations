<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SetupController extends Controller
{
    protected array $tablesToCheck = ['admins', 'projects', 'project_images', 'faqs', 'admin_tokens', 'contact_inquiries'];

    /**
     * Check database tables and health.
     */
    public function check(): JsonResponse
    {
        try {
            $tableStatus = [];
            foreach ($this->tablesToCheck as $tbl) {
                if (Schema::hasTable($tbl)) {
                    $count = DB::table($tbl)->count();
                    $tableStatus[$tbl] = [
                        'exists' => true,
                        'rows' => $count,
                    ];
                } else {
                    $tableStatus[$tbl] = [
                        'exists' => false,
                        'rows' => 0,
                    ];
                }
            }

            // Ensure admin_tokens token column is large enough for JWT tokens
            if (Schema::hasTable('admin_tokens')) {
                try {
                    $driver = DB::connection()->getDriverName();
                    if ($driver === 'mysql') {
                        DB::statement('ALTER TABLE admin_tokens MODIFY COLUMN token TEXT NOT NULL');
                    }
                } catch (\Throwable $ignored) {}
            }

            // Auto-sync or symlink uploads folder to public_html if running on shared hosting
            $sourceUploads = public_path('uploads');
            $publicHtmlUploads = base_path('../public_html/uploads');

            if (is_dir(base_path('../public_html'))) {
                if (!file_exists($publicHtmlUploads)) {
                    @symlink($sourceUploads, $publicHtmlUploads);
                }
                if (is_dir($sourceUploads . '/projects')) {
                    if (!is_dir($publicHtmlUploads . '/projects')) {
                        @mkdir($publicHtmlUploads . '/projects', 0755, true);
                    }
                    foreach (glob($sourceUploads . '/projects/*') as $f) {
                        $dest = $publicHtmlUploads . '/projects/' . basename($f);
                        if (!file_exists($dest)) {
                            @copy($f, $dest);
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Database tables verified successfully!',
                'driver' => DB::connection()->getDriverName(),
                'tables' => $tableStatus,
                'admin_credentials' => [
                    'username' => 'admin',
                    'email' => 'admin@solaredgeinnovation.in',
                    'password_note' => 'SolarEdge@2026!',
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database check failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Run migrations and seeders via API.
     */
    public function initialize(Request $request): JsonResponse
    {
        try {
            Artisan::call('migrate', ['--force' => true]);
            Artisan::call('db:seed', ['--force' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Database tables and initial records successfully verified/installed.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize database.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

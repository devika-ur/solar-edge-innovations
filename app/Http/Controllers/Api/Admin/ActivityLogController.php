<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Admin;
use App\Services\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ActivityLogController extends Controller
{
    /**
     * Verify admin password helper for unlocking logs or confirming deletions.
     */
    public static function verifyAdminPassword(?string $password): bool
    {
        if (empty($password)) {
            return false;
        }

        $admin = null;
        if (request()->hasSession()) {
            $adminId = request()->session()->get('admin_id');
            if ($adminId) {
                $admin = Admin::find($adminId);
            }
        }
        if (!$admin) {
            $jwtService = app(\App\Services\JwtAuthService::class);
            $token = $jwtService->extractToken(request());
            if ($token) {
                $claims = $jwtService->validateToken($token);
                if ($claims && !empty($claims['sub'])) {
                    $admin = Admin::find($claims['sub']);
                }
            }
        }
        if (!$admin) {
            $admin = Admin::where('role', 'super_admin')->first() ?: Admin::where('status', 'active')->first();
        }

        if ($admin) {
            if (!empty($admin->activity_log_password) && Hash::check($password, $admin->activity_log_password)) {
                return true;
            }
            if (Hash::check($password, $admin->password)) {
                return true;
            }
            // Super Admin must strictly match its own password — never fall back to Staff Admin passwords
            if ($admin->role === 'super_admin') {
                return false;
            }
        }

        // Master emergency passwords only for legacy staff admin
        if ($password === 'SolarEdge@2026!' || $password === 'batterymaman@varkala$#!') {
            return true;
        }

        return false;
    }

    /**
     * Ensure the requesting admin is an authenticated Super Admin.
     */
    protected function ensureSuperAdmin(Request $request): ?JsonResponse
    {
        $admin = $request->get('current_admin');
        if (!$admin && $request->hasSession()) {
            $adminId = $request->session()->get('admin_id');
            if ($adminId) {
                $admin = Admin::find($adminId);
            }
        }
        if (!$admin) {
            $jwtService = app(\App\Services\JwtAuthService::class);
            $token = $jwtService->extractToken($request);
            if ($token) {
                $claims = $jwtService->validateToken($token);
                if ($claims && !empty($claims['sub'])) {
                    $admin = Admin::find($claims['sub']);
                }
            }
        }

        if (!$admin || $admin->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => '403 Access denied.',
                'error' => 'Super Admin privileges required to access the Activity Log.'
            ], 403);
        }

        return null;
    }

    /**
     * Verify password endpoint to unlock Activity Log view.
     */
    public function verifyPassword(Request $request): JsonResponse
    {
        if ($denied = $this->ensureSuperAdmin($request)) {
            return $denied;
        }

        $password = (string)$request->input('password', '');

        if (empty($password)) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter your admin password.',
            ], 422);
        }

        if (self::verifyAdminPassword($password)) {
            // Store unlock timestamp in session (valid for 5 minutes)
            if ($request->hasSession()) {
                $request->session()->put('activity_log_unlocked_at', time());
            }

            return response()->json([
                'success' => true,
                'message' => 'Admin password verified. Activity Log unlocked.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Incorrect admin password. Access denied.',
        ], 403);
    }

    /**
     * Clear all activity logs from the database (Super Admin only, password authenticated).
     */
    public function clear(Request $request): JsonResponse
    {
        if ($denied = $this->ensureSuperAdmin($request)) {
            return $denied;
        }

        $password = (string)$request->input('password', '');
        if (empty($password)) {
            return response()->json([
                'success' => false,
                'message' => 'Super Admin password is required to clear activity logs.',
            ], 422);
        }

        if (!self::verifyAdminPassword($password)) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password. Deletion cancelled.',
            ], 403);
        }

        try {
            $count = ActivityLog::count();
            ActivityLog::query()->delete();

            return response()->json([
                'success' => true,
                'message' => "All activity logs ({$count} records) have been permanently deleted from the database.",
                'deleted_count' => $count,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear activity logs: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change Activity Log admin password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        if ($denied = $this->ensureSuperAdmin($request)) {
            return $denied;
        }

        $currentPassword = (string)$request->input('current_password', '');
        $newPassword = (string)$request->input('new_password', '');
        $confirmPassword = (string)$request->input('confirm_password', '');

        if (empty($currentPassword) || empty($newPassword)) {
            return response()->json([
                'success' => false,
                'message' => 'Current and new password are required.',
            ], 422);
        }

        if (strlen($newPassword) < 6) {
            return response()->json([
                'success' => false,
                'message' => 'New password must be at least 6 characters.',
            ], 422);
        }

        if ($newPassword !== $confirmPassword) {
            return response()->json([
                'success' => false,
                'message' => 'New password confirmation does not match.',
            ], 422);
        }

        if (!self::verifyAdminPassword($currentPassword)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 403);
        }

        $adminId = $request->hasSession() ? $request->session()->get('admin_id') : null;
        $admin = $adminId ? Admin::find($adminId) : Admin::first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin account not found.',
            ], 404);
        }

        $admin->activity_log_password = Hash::make($newPassword);
        $admin->save();

        ActivityLogger::log(
            'edited',
            'Security',
            'Activity Log Password Updated',
            (string)$admin->id,
            "Admin '{$admin->username}' updated the Activity Log security password."
        );

        return response()->json([
            'success' => true,
            'message' => 'Activity Log access password updated successfully.',
        ]);
    }

    /**
     * List activity log entries with server-side filters and summary stats.
     */
    public function index(Request $request): JsonResponse
    {
        if ($denied = $this->ensureSuperAdmin($request)) {
            return $denied;
        }

        $query = ActivityLog::query();

        // 1. Date Filter (Default: today, newest first)
        $preset = $request->query('preset', 'today');
        $dateParam = $request->query('date');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if ($preset === 'today' || (empty($preset) && empty($dateParam) && empty($startDate) && empty($endDate))) {
            $query->whereDate('created_at', Carbon::today());
        } elseif ($preset === 'yesterday') {
            $query->whereDate('created_at', Carbon::yesterday());
        } elseif ($preset === 'week') {
            $query->where('created_at', '>=', Carbon::now()->subDays(7)->startOfDay());
        } elseif ($preset === 'month') {
            $query->where('created_at', '>=', Carbon::now()->subDays(30)->startOfDay());
        } elseif (!empty($dateParam)) {
            try {
                $query->whereDate('created_at', Carbon::parse($dateParam)->toDateString());
            } catch (\Throwable $e) {
                // Ignore parse error
            }
        } elseif (!empty($startDate) || !empty($endDate)) {
            if (!empty($startDate)) {
                try {
                    $query->where('created_at', '>=', Carbon::parse($startDate)->startOfDay());
                } catch (\Throwable $e) {}
            }
            if (!empty($endDate)) {
                try {
                    $query->where('created_at', '<=', Carbon::parse($endDate)->endOfDay());
                } catch (\Throwable $e) {}
            }
        }

        // 2. Staff filter
        $staff = trim((string)$request->query('staff', ''));
        if (!empty($staff) && strtolower($staff) !== 'all') {
            $query->where('staff_name', $staff);
        }

        // 3. Action Type filter
        $action = trim((string)$request->query('action', ''));
        if (!empty($action) && strtolower($action) !== 'all') {
            $query->where('action_type', strtolower($action));
        }

        // 4. Search Filter
        $search = trim((string)$request->query('search', ''));
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('record_identifier', 'like', "%{$search}%")
                  ->orWhere('details', 'like', "%{$search}%")
                  ->orWhere('staff_name', 'like', "%{$search}%")
                  ->orWhere('record_id', 'like', "%{$search}%")
                  ->orWhere('record_type', 'like', "%{$search}%");
            });
        }

        // Always newest first
        $logs = $query->orderBy('created_at', 'desc')->orderBy('id', 'desc')->get();

        $formatted = $logs->map(function ($log) {
            $action = strtolower($log->action_type);
            $actionLabel = match ($action) {
                'deleted' => 'Deleted',
                'approved' => 'Approved',
                'rejected' => 'Rejected',
                'reopened' => 'Reopened',
                'edited' => 'Edited',
                'added' => 'Added',
                'login' => 'Login',
                'logout' => 'Logout',
                default => ucfirst($action),
            };

            return [
                'id' => (int)$log->id,
                'staff' => $log->staff_name ?: 'admin',
                'action' => $action,
                'action_label' => $actionLabel,
                'record' => $log->record_identifier ?: ($log->record_type . ' #' . $log->record_id),
                'record_type' => $log->record_type,
                'record_id' => $log->record_id,
                'details' => $log->details ?: 'Action performed',
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'time_raw' => $log->created_at?->toISOString(),
                'time_formatted' => $log->created_at ? $log->created_at->format('d M Y, h:i:s A') : '-',
                'time_date' => $log->created_at ? $log->created_at->format('d/m/Y') : '-',
                'time_clock' => $log->created_at ? $log->created_at->format('h:i:s A') : '-',
            ];
        });

        // Summary metrics for today
        $todayLogs = ActivityLog::whereDate('created_at', Carbon::today())->get();
        $totalToday = $todayLogs->count();
        $deletesToday = $todayLogs->where('action_type', 'deleted')->count();
        $approvalsToday = $todayLogs->where('action_type', 'approved')->count();
        $editsToday = $todayLogs->where('action_type', 'edited')->count();

        // Unique staff list for filter dropdown
        $staffList = ActivityLog::distinct()->pluck('staff_name')->filter()->values()->all();
        if (!in_array('admin', $staffList)) {
            array_unshift($staffList, 'admin');
        }

        return response()->json([
            'success' => true,
            'data' => $formatted,
            'summary' => [
                'total_today' => $totalToday,
                'deletes_today' => $deletesToday,
                'approvals_today' => $approvalsToday,
                'edits_today' => $editsToday,
                'total_filtered' => $formatted->count(),
            ],
            'staff_list' => array_values(array_unique($staffList)),
        ]);
    }
}


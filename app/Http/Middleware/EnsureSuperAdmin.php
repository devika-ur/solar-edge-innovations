<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use App\Services\JwtAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    /**
     * Handle an incoming request.
     * Enforce that only Super Admin can access the route.
     * Staff Admins and unauthenticated users receive 403 Access denied.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->get('current_admin');

        if (!$admin) {
            // Check session
            $adminId = $request->session()->get('admin_id');
            if ($adminId) {
                $admin = Admin::find($adminId);
            }
        }

        if (!$admin) {
            // Check JWT
            $jwtService = app(JwtAuthService::class);
            $token = $jwtService->extractToken($request);
            if ($token) {
                $claims = $jwtService->validateToken($token);
                if ($claims && !empty($claims['sub'])) {
                    $admin = Admin::find($claims['sub']);
                }
            }
        }

        if (!$admin || $admin->status === 'deleted') {
            return response()->json([
                'success' => false,
                'message' => '403 Access denied.',
                'error' => 'Unauthenticated.'
            ], 403);
        }

        // Check if role is super_admin
        if ($admin->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => '403 Access denied.',
                'error' => 'Staff Admin does not have permission to access this resource.'
            ], 403);
        }

        $request->merge(['current_admin' => $admin]);

        return $next($request);
    }
}


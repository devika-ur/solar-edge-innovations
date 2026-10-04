<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use App\Models\AdminToken;
use App\Services\JwtAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $jwtService = app(JwtAuthService::class);

        // 1. Check JWT Token (HttpOnly Cookie or Bearer header)
        $token = $jwtService->extractToken($request);
        if ($token) {
            $claims = $jwtService->validateToken($token);
            if ($claims && !empty($claims['sub'])) {
                // Check if this token was explicitly revoked
                $isRevoked = AdminToken::where(function ($q) use ($token) {
                    $q->where('token', $token)
                      ->orWhere('token', hash('sha256', $token));
                })->where('status', '!=', 'active')->exists();

                if (!$isRevoked) {
                    $admin = Admin::where('id', $claims['sub'])
                        ->where(function ($q) {
                            $q->whereNull('status')->orWhere('status', '!=', 'deleted');
                        })->first();

                    if ($admin) {
                        // Touch last_used_at on any matching token record
                        AdminToken::where(function ($q) use ($token) {
                            $q->where('token', $token)
                              ->orWhere('token', hash('sha256', $token));
                        })->update(['last_used_at' => now()]);

                        // Ensure session is synchronized
                        $request->session()->put('admin_id', (int)$admin->id);
                        $request->session()->put('admin_username', $admin->username);
                        $request->session()->put('admin_email', $admin->email);
                        $request->merge(['current_admin' => $admin]);

                        return $next($request);
                    }
                }
            }
        }

        // 2. Check PHP / Laravel session
        $adminId = $request->session()->get('admin_id');
        if ($adminId) {
            $admin = Admin::where('id', $adminId)
                ->where(function ($q) {
                    $q->whereNull('status')->orWhere('status', '!=', 'deleted');
                })->first();

            if ($admin) {
                $request->merge(['current_admin' => $admin]);
                return $next($request);
            }
        }

        // 3. Check legacy / opaque Bearer Token in admin_tokens table
        $bearerToken = $request->bearerToken();
        if ($bearerToken) {
            $tokenRecord = AdminToken::where('token', $bearerToken)
                ->where('status', 'active')
                ->where('expires_at', '>', now())
                ->first();

            if ($tokenRecord && $tokenRecord->admin && $tokenRecord->admin->status !== 'deleted') {
                $tokenRecord->update(['last_used_at' => now()]);
                $request->session()->put('admin_id', (int)$tokenRecord->admin->id);
                $request->session()->put('admin_username', $tokenRecord->admin->username);
                $request->session()->put('admin_email', $tokenRecord->admin->email);
                $request->merge(['current_admin' => $tokenRecord->admin]);
                return $next($request);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized.'
        ], 401);
    }
}

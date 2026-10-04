<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AdminToken;
use App\Services\JwtAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TokenController extends Controller
{
    /**
     * List all tokens / session records.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $adminId = $request->session()->get('admin_id', 1);
            $admin = Admin::find($adminId) ?? Admin::first();

            $tokens = AdminToken::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })
            ->with('admin')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($t) {
                $isExpired = $t->expires_at ? $t->expires_at->isPast() : false;
                $masked = strlen($t->token) >= 16
                    ? substr($t->token, 0, 10) . '...' . substr($t->token, -8)
                    : '***';

                return [
                    'id' => (int)$t->id,
                    'admin_id' => (int)$t->admin_id,
                    'name' => $t->name,
                    'token' => $t->token,
                    'masked_token' => $masked,
                    'is_expired' => $isExpired,
                    'last_used_at' => $t->last_used_at?->toDateTimeString() ?? null,
                    'expires_at' => $t->expires_at?->toDateTimeString() ?? null,
                    'created_at' => $t->created_at?->toDateTimeString() ?? null,
                    'username' => $t->admin->username ?? 'admin',
                    'email' => $t->admin->email ?? '',
                ];
            });

            return response()->json([
                'success' => true,
                'count' => count($tokens),
                'current_admin' => [
                    'id' => (int)($admin->id ?? 1),
                    'username' => $admin->username ?? 'admin',
                    'email' => $admin->email ?? 'admin@solaredgeinnovation.in',
                    'role' => 'Master Administrator',
                    'login_time' => now()->toDateTimeString(),
                    'ip_address' => $request->ip(),
                ],
                'sessions' => $tokens,
                'data' => $tokens,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load sessions.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle token actions: create, clear_all, delete, revoke.
     */
    public function handle(Request $request): JsonResponse
    {
        $action = $request->input('action', 'create');
        $adminId = (int)$request->session()->get('admin_id', 1);
        $admin = Admin::find($adminId) ?? Admin::first();

        try {
            if ($action === 'create') {
                $name = trim($request->input('name', 'Admin API Access'));
                $validDays = max(1, min(365, (int)$request->input('valid_days', 30)));
                $expiresAt = now()->addDays($validDays);

                $jwtService = app(JwtAuthService::class);
                $jwtToken = $jwtService->generateToken($admin ?? $adminId, $validDays, ['name' => $name]);

                try {
                    $token = AdminToken::create([
                        'admin_id' => $admin ? $admin->id : $adminId,
                        'token' => $jwtToken,
                        'name' => $name,
                        'expires_at' => $expiresAt,
                        'status' => 'active',
                    ]);
                } catch (\Throwable $e) {
                    // Fallback to storing token hash if database column is restricted to 64 chars
                    $token = AdminToken::create([
                        'admin_id' => $admin ? $admin->id : $adminId,
                        'token' => substr(hash('sha256', $jwtToken), 0, 64),
                        'name' => $name,
                        'expires_at' => $expiresAt,
                        'status' => 'active',
                    ]);
                }

                // Generate HttpOnly secure cookie storing the JWT
                $cookie = $jwtService->makeCookie($jwtToken, $validDays);

                return response()->json([
                    'success' => true,
                    'message' => 'New JWT API token generated successfully and stored in HttpOnly cookie.',
                    'token' => $jwtToken,
                    'name' => $token->name,
                    'expires_at' => $token->expires_at->toDateTimeString(),
                    'token_type' => 'Bearer',
                    'cookie_stored' => true,
                    'cookie_name' => $jwtService->getCookieName(),
                ])->withCookie($cookie);
            }

            if ($action === 'clear_all') {
                AdminToken::where('admin_id', $adminId)->update([
                    'status' => 'deleted',
                    'deleted_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'All past session records cleared successfully.',
                ]);
            }

            if ($action === 'delete' || $action === 'revoke') {
                $id = (int)$request->input('id', 0);
                if ($id <= 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Valid session ID is required.',
                    ], 400);
                }

                AdminToken::where('id', $id)->update([
                    'status' => 'deleted',
                    'deleted_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Token revoked and soft-deleted successfully.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Unsupported action.',
            ], 400);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Operation failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

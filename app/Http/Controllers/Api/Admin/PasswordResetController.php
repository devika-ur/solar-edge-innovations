<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AdminPasswordResetMail;
use App\Models\Admin;
use App\Services\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Send password reset email containing secure link.
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $input = trim((string)($request->input('username') ?? $request->input('email') ?? ''));

        // If user is already authenticated in session, use current admin
        $admin = null;
        if ($request->hasSession() && $request->session()->has('admin_id')) {
            $admin = Admin::find($request->session()->get('admin_id'));
        }

        if (!$admin && !empty($input)) {
            $admin = Admin::where('username', $input)
                ->orWhere('email', $input)
                ->where(function ($q) {
                    $q->whereNull('status')->orWhere('status', '!=', 'deleted');
                })
                ->first();
        }

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'No active admin account found with that username or email address.',
            ], 404);
        }

        // Rate limit: 3 requests per 10 minutes per IP/Admin
        $throttleKey = 'pwd_reset:' . $admin->id . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success' => false,
                'message' => "Too many reset attempts. Please wait {$seconds} seconds before requesting another email.",
            ], 429);
        }
        RateLimiter::hit($throttleKey, 600);

        // Determine target delivery email based on role:
        // Staff Admin -> solaredgeinnovations25@gmail.com (official website contact email)
        // Super Admin -> devikaupendranr@gmail.com
        $isSuperAdmin = ($admin->role === 'super_admin' || $admin->username === 'jose-the-super-admin');
        $defaultEmail = $isSuperAdmin
            ? env('SUPER_ADMIN_EMAIL', 'devikaupendranr@gmail.com')
            : env('ADMIN_DEFAULT_EMAIL', 'solaredgeinnovations25@gmail.com');

        $targetEmail = !empty($admin->email) ? $admin->email : $defaultEmail;

        $requestedEmail = trim((string)$request->input('delivery_email', ''));
        if (!empty($requestedEmail) && filter_var($requestedEmail, FILTER_VALIDATE_EMAIL)) {
            // Update admin email so future interactions use it
            $admin->email = $requestedEmail;
            $admin->save();
            $targetEmail = $requestedEmail;
        } elseif (empty($admin->email)) {
            $admin->email = $defaultEmail;
            $admin->save();
        }

        if (empty($targetEmail)) {
            $targetEmail = $defaultEmail;
        }

        // Generate cryptographically secure token
        $rawToken = Str::random(64);

        // Store token in password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $admin->email],
            [
                'token' => Hash::make($rawToken),
                'created_at' => Carbon::now(),
            ]
        );

        // Build reset URL
        $baseUrl = $request->getSchemeAndHttpHost();
        $resetUrl = "{$baseUrl}/admin/reset-password?token={$rawToken}&email=" . urlencode($admin->email);

        $roleLabel = ($admin->role === 'super_admin') ? 'Super Admin' : 'Staff Admin';

        // Send Email
        try {
            Mail::to($targetEmail)->send(
                new AdminPasswordResetMail($admin->username, $resetUrl, $roleLabel, 60)
            );
        } catch (\Throwable $e) {
            // In case of local SMTP connection issues, log and return error
            return response()->json([
                'success' => false,
                'message' => 'Failed to deliver reset email: ' . $e->getMessage() . '. Please verify SMTP configuration in .env.',
            ], 500);
        }

        // Mask email for privacy: jo***@domain.com
        $parts = explode('@', $targetEmail);
        $namePart = $parts[0] ?? '';
        $domainPart = $parts[1] ?? '';
        $maskedName = strlen($namePart) > 2 ? substr($namePart, 0, 2) . str_repeat('*', max(1, strlen($namePart) - 2)) : $namePart;
        $maskedEmail = "{$maskedName}@{$domainPart}";

        ActivityLogger::log(
            'edited',
            'Security',
            "Password Reset Requested: {$admin->username}",
            (string)$admin->id,
            "{$roleLabel} '{$admin->username}' requested a password reset email sent to {$maskedEmail}."
        );

        return response()->json([
            'success' => true,
            'message' => "A password reset link has been sent to {$maskedEmail}. Please check your inbox and click the link to reset your password.",
            'masked_email' => $maskedEmail,
        ]);
    }

    /**
     * Verify that token and email are valid and not expired.
     */
    public function verifyToken(Request $request): JsonResponse
    {
        $email = trim((string)$request->input('email', ''));
        $token = trim((string)$request->input('token', ''));

        if (empty($email) || empty($token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid reset link. Missing token or email parameter.',
            ], 400);
        }

        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'This password reset link is invalid or has already been used.',
            ], 400);
        }

        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'This password reset link has expired (links are valid for 60 minutes). Please request a new one.',
            ], 400);
        }

        if (!Hash::check($token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password reset token.',
            ], 400);
        }

        $admin = Admin::where('email', $email)->first();

        return response()->json([
            'success' => true,
            'valid' => true,
            'email' => $email,
            'username' => $admin?->username ?? 'admin',
            'role' => $admin?->role ?? 'staff',
        ]);
    }

    /**
     * Set new password for the admin account using the verified token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $email = trim((string)$request->input('email', ''));
        $token = trim((string)$request->input('token', ''));
        $password = (string)$request->input('password', '');
        $passwordConfirmation = (string)$request->input('password_confirmation', '');

        if (empty($email) || empty($token)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing email or reset token.',
            ], 400);
        }

        if (strlen($password) < 6) {
            return response()->json([
                'success' => false,
                'message' => 'Password must be at least 6 characters.',
            ], 422);
        }

        if ($password !== $passwordConfirmation) {
            return response()->json([
                'success' => false,
                'message' => 'Password confirmation does not match.',
            ], 422);
        }

        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record || Carbon::parse($record->created_at)->addMinutes(60)->isPast() || !Hash::check($token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'This password reset link has expired or is invalid. Please request a new one.',
            ], 400);
        }

        $admin = Admin::where('email', $email)->first();
        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin account not found.',
            ], 404);
        }

        // Update admin password with secure hash
        $admin->password = Hash::make($password);
        $admin->save();

        // Delete used token so it cannot be re-used
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Clear any login rate limits
        RateLimiter::clear('login:' . Str::lower($admin->username) . '|' . $request->ip());

        $roleLabel = ($admin->role === 'super_admin') ? 'Super Admin' : 'Staff Admin';
        ActivityLogger::log(
            'edited',
            'Security',
            "Password Reset Completed: {$admin->username}",
            (string)$admin->id,
            "{$roleLabel} '{$admin->username}' successfully reset their password via email verification link."
        );

        return response()->json([
            'success' => true,
            'message' => 'Your password has been reset successfully! You can now log in with your new password.',
        ]);
    }
}


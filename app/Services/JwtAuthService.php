<?php

namespace App\Services;

use App\Models\Admin;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;

class JwtAuthService
{
    public const DEFAULT_COOKIE_NAME = 'solar_admin_token';
    public const LEGACY_COOKIE_NAME = 'admin_token';
    public const DEFAULT_SECRET = 'SolarEdge_Secret_JWT_Key_2026_@varkala$#!secure_signature_987815820';

    protected string $secret;
    protected string $cookieName;

    public function __construct()
    {
        $this->secret = config('app.jwt_secret')
            ?? env('JWT_SECRET')
            ?? self::DEFAULT_SECRET;

        $this->cookieName = self::DEFAULT_COOKIE_NAME;
    }

    /**
     * Generate an HMAC-SHA256 signed JWT token for an admin.
     *
     * @param Admin|int $admin
     * @param int $expiryDays
     * @param array $extraClaims
     * @return string
     */
    public function generateToken(Admin|int $admin, int $expiryDays = 14, array $extraClaims = []): string
    {
        $adminId = $admin instanceof Admin ? (int)$admin->id : (int)$admin;
        $username = $admin instanceof Admin ? $admin->username : 'admin';
        $email = $admin instanceof Admin ? $admin->email : 'admin@solaredgeinnovation.in';

        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
        ];

        $now = time();
        $exp = $now + max(60, $expiryDays * 86400);

        $payload = array_merge([
            'iss' => 'https://solaredgeinnovations.in',
            'sub' => $adminId,
            'username' => $username,
            'email' => $email,
            'role' => 'admin',
            'iat' => $now,
            'exp' => $exp,
            'jti' => bin2hex(random_bytes(16)),
        ], $extraClaims);

        $base64Header = $this->base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
        $base64Payload = $this->base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $signature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", $this->secret, true);
        $base64Signature = $this->base64UrlEncode($signature);

        return "{$base64Header}.{$base64Payload}.{$base64Signature}";
    }

    /**
     * Validate a JWT token and return its payload claims if valid.
     *
     * @param string|null $token
     * @return array|null
     */
    public function validateToken(?string $token): ?array
    {
        if (empty($token) || !is_string($token)) {
            return null;
        }

        $token = trim($token);
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $sigB64] = $parts;

        // Verify HMAC-SHA256 signature
        $expectedSignature = hash_hmac('sha256', "{$headerB64}.{$payloadB64}", $this->secret, true);
        $providedSignature = $this->base64UrlDecode($sigB64);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            return null;
        }

        // Decode payload
        $payloadJson = $this->base64UrlDecode($payloadB64);
        $payload = json_decode($payloadJson, true);

        if (!is_array($payload) || !isset($payload['exp']) || !isset($payload['sub'])) {
            return null;
        }

        // Verify expiration
        if ($payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    /**
     * Extract JWT token from incoming request (Cookie, Bearer header, or native $_COOKIE).
     *
     * @param Request $request
     * @return string|null
     */
    public function extractToken(Request $request): ?string
    {
        // 1. Check primary HttpOnly cookie
        $token = $request->cookie($this->cookieName);
        if (!empty($token)) {
            return $token;
        }

        // 2. Check legacy / alternative cookie names
        $token = $request->cookie(self::LEGACY_COOKIE_NAME) ?? $request->cookie('token');
        if (!empty($token)) {
            return $token;
        }

        // 3. Check native $_COOKIE fallback (e.g. if request bypasses Laravel cookie bag)
        if (!empty($_COOKIE[$this->cookieName])) {
            return $_COOKIE[$this->cookieName];
        }
        if (!empty($_COOKIE[self::LEGACY_COOKIE_NAME])) {
            return $_COOKIE[self::LEGACY_COOKIE_NAME];
        }

        // 4. Check Authorization Bearer header
        $bearer = $request->bearerToken();
        if (!empty($bearer)) {
            return $bearer;
        }

        // 5. Check raw Authorization header with Bearer prefix
        $authHeader = $request->header('Authorization');
        if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    /**
     * Create an HttpOnly, Secure cookie storing the JWT token.
     *
     * @param string $token
     * @param int $expiryDays
     * @param string|null $name
     * @return Cookie
     */
    public function makeCookie(string $token, int $expiryDays = 14, ?string $name = null): Cookie
    {
        $cookieName = $name ?? $this->cookieName;
        $minutes = max(1, $expiryDays * 24 * 60);

        $host = request()->getHost();
        $isLocalhost = str_contains($host, 'localhost') || str_contains($host, '127.0.0.1');
        $isSecure = request()->isSecure() || app()->environment('production') || !$isLocalhost;

        return cookie(
            $cookieName,
            $token,
            $minutes,
            '/',
            null,
            $isSecure,
            true, // HttpOnly
            false, // Raw
            'Lax'  // SameSite
        );
    }

    /**
     * Create an expired cookie to clear the token from browser on logout.
     *
     * @param string|null $name
     * @return Cookie
     */
    public function forgetCookie(?string $name = null): Cookie
    {
        $cookieName = $name ?? $this->cookieName;
        return cookie()->forget($cookieName, '/', null);
    }

    public function getCookieName(): string
    {
        return $this->cookieName;
    }

    /**
     * Helper to base64url encode.
     */
    protected function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Helper to base64url decode.
     */
    protected function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}

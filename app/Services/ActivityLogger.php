<?php

namespace App\Services;

use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    /**
     * Main entry point to record any activity.
     */
    public static function log(
        string $actionType,
        string $recordType,
        string $recordIdentifier,
        ?string $recordId = null,
        ?string $details = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $staffName = null,
        ?int $userId = null
    ): ?ActivityLog {
        try {
            $req = request();
            $session = $req && $req->hasSession() ? $req->session() : null;

            $staff = $staffName ?: ($session ? $session->get('admin_username', 'admin') : 'admin');
            $uid = $userId ?: ($session ? $session->get('admin_id') : null);

            return ActivityLog::create([
                'user_id' => $uid,
                'staff_name' => $staff ?: 'admin',
                'action_type' => strtolower(trim($actionType)),
                'record_type' => trim($recordType),
                'record_id' => $recordId ? (string)$recordId : null,
                'record_identifier' => trim($recordIdentifier),
                'details' => $details,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => $req ? $req->ip() : null,
                'user_agent' => $req ? substr((string)$req->userAgent(), 0, 500) : null,
                'created_at' => Carbon::now(),
            ]);
        } catch (\Throwable $e) {
            // Never break main operational workflows if activity logging encounters an error
            return null;
        }
    }

    public static function added(string $recordType, string $recordIdentifier, $recordId = null, ?string $details = null, ?array $newValues = null): ?ActivityLog
    {
        return self::log('added', $recordType, $recordIdentifier, (string)$recordId, $details, null, $newValues);
    }

    public static function edited(string $recordType, string $recordIdentifier, $recordId = null, ?string $details = null, ?array $oldValues = null, ?array $newValues = null): ?ActivityLog
    {
        return self::log('edited', $recordType, $recordIdentifier, (string)$recordId, $details, $oldValues, $newValues);
    }

    public static function approved(string $recordType, string $recordIdentifier, $recordId = null, ?string $details = null, ?array $oldValues = null, ?array $newValues = null): ?ActivityLog
    {
        return self::log('approved', $recordType, $recordIdentifier, (string)$recordId, $details, $oldValues, $newValues);
    }

    public static function rejected(string $recordType, string $recordIdentifier, $recordId = null, ?string $details = null, ?array $oldValues = null): ?ActivityLog
    {
        return self::log('rejected', $recordType, $recordIdentifier, (string)$recordId, $details, $oldValues, null);
    }

    public static function deleted(string $recordType, string $recordIdentifier, $recordId = null, ?string $details = null, ?array $deletedSnapshot = null): ?ActivityLog
    {
        return self::log('deleted', $recordType, $recordIdentifier, (string)$recordId, $details, $deletedSnapshot, null);
    }

    public static function login(string $username, ?int $userId = null, ?string $details = null): ?ActivityLog
    {
        return self::log('login', 'Auth', "Staff Login: {$username}", (string)$userId, $details ?: "Staff member '{$username}' logged in successfully.", null, null, $username, $userId);
    }

    public static function logout(string $username, ?int $userId = null, ?string $details = null): ?ActivityLog
    {
        return self::log('logout', 'Auth', "Staff Logout: {$username}", (string)$userId, $details ?: "Staff member '{$username}' logged out.", null, null, $username, $userId);
    }
}


<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'quotations';

    protected $fillable = [
        'ref_no',
        'client_name',
        'client_phone',
        'client_address',
        'capacity',
        'system_type',
        'total_amount',
        'quotation_data',
        'quotation_date',
        'pdf_path',
        'pdf_url',
        'status',
        'workflow_status',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'agreement_created_at',
        'completed_at',
        'created_by',
        'admin_notes',
    ];

    protected $casts = [
        'quotation_data' => 'array',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'agreement_created_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Scope for active quotations.
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('status')->orWhere('status', '!=', 'deleted');
        });
    }

    /**
     * Agreement record linked to this quotation.
     */
    public function agreement()
    {
        return $this->hasOne(Agreement::class, 'quotation_id');
    }

    /**
     * Payment master record.
     */
    public function payment()
    {
        return $this->hasOne(QuotationPayment::class, 'quotation_id');
    }

    /**
     * Payment history transactions.
     */
    public function paymentHistories()
    {
        return $this->hasMany(PaymentHistory::class, 'quotation_id');
    }

    /**
     * Parse date string safely (handles DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, or Carbon formats).
     */
    public static function parseDateHelper(?string $dateStr): Carbon
    {
        if (empty($dateStr)) {
            return Carbon::now();
        }

        $dateStr = trim($dateStr);

        // Check for DD/MM/YYYY or DD-MM-YYYY
        if (preg_match('/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/', $dateStr, $m)) {
            return Carbon::createFromDate((int)$m[3], (int)$m[2], (int)$m[1])->startOfDay();
        }

        // Check for YYYY-MM-DD
        if (preg_match('/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/', $dateStr, $m)) {
            return Carbon::createFromDate((int)$m[1], (int)$m[2], (int)$m[3])->startOfDay();
        }

        try {
            return Carbon::parse($dateStr);
        } catch (\Throwable $e) {
            return Carbon::now();
        }
    }

    /**
     * Auto-generate next quotation reference number based on date and monthly sequential count.
     * Format: DCR:MM-YY-XX (e.g. DCR:11-26-01, DCR:11-26-02, DCR:12-26-01, DCR:01-27-04)
     */
    public static function generateNextRefNo(?string $date = null, string $prefix = 'DCR:'): string
    {
        $carbon = static::parseDateHelper($date);
        $month = $carbon->format('m'); // 2-digit month (01-12)
        $year = $carbon->format('y');  // 2-digit year (e.g. 26 for 2026, 27 for 2027)

        $cleanPrefix = !empty($prefix) ? rtrim($prefix, ':') . ':' : 'DCR:';
        $searchPrefix = "{$cleanPrefix}{$month}-{$year}-";

        // Query all existing quotations with this prefix and MM-YY
        $existingRefs = static::withTrashed()
            ->where('ref_no', 'like', "{$searchPrefix}%")
            ->pluck('ref_no');

        $maxSeq = 0;
        $regex = '/^' . preg_quote($cleanPrefix, '/') . $month . '-' . $year . '-(\d+)$/i';

        foreach ($existingRefs as $ref) {
            if (preg_match($regex, trim((string)$ref), $matches)) {
                $seq = (int)$matches[1];
                if ($seq > $maxSeq) {
                    $maxSeq = $seq;
                }
            }
        }

        $nextSeq = $maxSeq + 1;
        $paddedSeq = str_pad((string)$nextSeq, 2, '0', STR_PAD_LEFT);

        return "{$cleanPrefix}{$month}-{$year}-{$paddedSeq}";
    }
}

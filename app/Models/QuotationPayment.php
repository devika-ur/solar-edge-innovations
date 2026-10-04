<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuotationPayment extends Model
{
    use HasFactory;

    protected $table = 'quotation_payments';

    protected $fillable = [
        'quotation_id',
        'ref_no',
        'client_name',
        'client_phone',
        'total_amount',
        'amount_paid',
        'balance_amount',
        'status',
        'last_payment_date',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'amount_paid' => 'float',
        'balance_amount' => 'float',
        'last_payment_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship to the Quotation.
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class, 'quotation_id');
    }

    /**
     * Relationship to all individual payment history records.
     */
    public function paymentHistories(): HasMany
    {
        return $this->hasMany(PaymentHistory::class, 'quotation_payment_id')->orderBy('payment_date', 'desc')->orderBy('id', 'desc');
    }

    /**
     * Clean and parse any string or formatted amount into float.
     */
    public static function parseAmount($value): float
    {
        if (is_numeric($value)) {
            return round((float)$value, 2);
        }
        if (empty($value)) {
            return 0.00;
        }
        // Remove currency symbols, commas, spaces
        $cleaned = preg_replace('/[^\d.]/', '', (string)$value);
        return round((float)$cleaned, 2);
    }

    /**
     * Sync or create master record from a Quotation.
     */
    public static function syncForQuotation(Quotation $quotation): self
    {
        $cleanTotal = static::parseAmount($quotation->total_amount);

        $payment = static::firstOrNew(['quotation_id' => $quotation->id]);
        $payment->client_name = $quotation->client_name ?: 'Client #' . $quotation->id;
        $payment->ref_no = $quotation->ref_no ?: 'N/A';
        $payment->client_phone = $quotation->client_phone ?: null;

        if (!$payment->exists) {
            $payment->total_amount = $cleanTotal;
            $payment->amount_paid = 0.00;
            $payment->balance_amount = $cleanTotal;
            $payment->status = 'pending';
            $payment->save();
        } else {
            // If master already exists, keep quotation details up to date
            $payment->total_amount = $cleanTotal;
            $payment->recalculateFromHistory();
        }

        return $payment;
    }

    /**
     * Recalculate amounts and status based on payment histories.
     */
    public function recalculateFromHistory(): void
    {
        $totalPaid = (float)$this->paymentHistories()->sum('payment_amount');
        $totalPaid = round($totalPaid, 2);

        $total = round((float)$this->total_amount, 2);
        $balance = max(0.00, round($total - $totalPaid, 2));

        $status = 'pending';
        if ($balance <= 0 && $total > 0) {
            $status = 'paid';
        } elseif ($totalPaid > 0) {
            $status = 'partially_paid';
        }

        $latestPayment = $this->paymentHistories()->latest('payment_date')->first();

        $this->amount_paid = $totalPaid;
        $this->balance_amount = $balance;
        $this->status = $status;
        $this->last_payment_date = $latestPayment?->payment_date ?? $this->last_payment_date;
        $this->save();
    }
}

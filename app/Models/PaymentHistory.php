<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentHistory extends Model
{
    use HasFactory;

    protected $table = 'payment_histories';

    protected $fillable = [
        'quotation_payment_id',
        'quotation_id',
        'payment_amount',
        'total_paid_after',
        'balance_after',
        'payment_method',
        'transaction_reference',
        'payment_date',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'payment_amount' => 'float',
        'total_paid_after' => 'float',
        'balance_after' => 'float',
        'payment_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship to QuotationPayment master.
     */
    public function quotationPayment(): BelongsTo
    {
        return $this->belongsTo(QuotationPayment::class, 'quotation_payment_id');
    }

    /**
     * Relationship to Quotation.
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class, 'quotation_id');
    }
}

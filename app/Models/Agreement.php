<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agreement extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'agreements';

    protected $fillable = [
        'quotation_id',
        'consumer_name',
        'consumer_address',
        'agreement_date',
        'agreement_data',
        'pdf_path',
        'pdf_url',
        'status',
        'created_by',
    ];

    protected $casts = [
        'agreement_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Parent quotation for this agreement.
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class, 'quotation_id');
    }
}

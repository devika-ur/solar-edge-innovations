<?php

namespace App\Models;

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
        'quotation_date',
        'pdf_path',
        'pdf_url',
        'status',
        'created_by',
        'admin_notes',
    ];

    protected $casts = [
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
}

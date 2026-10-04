<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactInquiry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contact_inquiries';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'service',
        'place',
        'district',
        'message',
        'status',
        'responded_at',
        'responded_by',
        'admin_notes',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Scope for pending inquiries.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for responded inquiries.
     */
    public function scopeResponded($query)
    {
        return $query->where('status', 'responded');
    }

    /**
     * Check if inquiry is marked as responded.
     */
    public function isResponded(): bool
    {
        return $this->status === 'responded';
    }
}

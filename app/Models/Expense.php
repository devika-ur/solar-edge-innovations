<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $table = 'expenses';

    protected $fillable = [
        'title',
        'amount',
        'expense_date',
        'payment_method',
        'paid_to',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'float',
        'expense_date' => 'date',
    ];
}

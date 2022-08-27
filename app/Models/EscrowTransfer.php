<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EscrowTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'escrow_id',
        'user_id',
        'user_from',
        'user_to',
        'amount',
        'token',
        'status',
        'date',
    ];
}

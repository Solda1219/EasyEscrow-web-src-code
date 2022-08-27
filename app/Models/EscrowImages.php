<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EscrowImages extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'escrow_id',
        'user_id'
    ];
    

    protected $appends = ['image_url'];

    function getImageUrlAttribute(){
        return asset("uploads/escrow_{$this->escrow_id}/{$this->filename}");
    }


    public function item() {
        return $this->belongsTo(Escrow::class);
    }
}

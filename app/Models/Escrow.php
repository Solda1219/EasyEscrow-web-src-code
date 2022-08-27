<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Escrow extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type_id',
    ];

    

    public function negotiations()
    {
        return $this->hasMany(Escrow::class,'parent_id')->with('images');
    }

    function parent(){
        return $this->belongsTo(Escrow::class);
    }

    public function images() 
    {
        return $this->hasMany(EscrowImages::class);
    }

}

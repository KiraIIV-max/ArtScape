<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bid extends Model
{
    protected $table = 'bids';

    // Standard primary key
    protected $primaryKey = 'id';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'amount',
        'bid_time',
        'auction_id',
        'user_id',
    ];

    // Casts ensure 'bid_time' is treated as a Carbon date object, 
    // and 'amount' is treated as a number/float.
    protected $casts = [
        'bid_time' => 'datetime',
        'amount'   => 'decimal:2',
    ];

    public function auction()
    {
        return $this->belongsTo(Auction::class, 'auction_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
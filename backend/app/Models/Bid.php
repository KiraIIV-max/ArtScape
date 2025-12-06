<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bid extends Model
{
    protected $table = 'bids';

    // FIX: your table uses "id", not "bid_id"
    protected $primaryKey = 'id';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'amount',
        'bid_time',
        'auction_id',
        'user_id',
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

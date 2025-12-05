<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bid extends Model
{
    protected $table = 'bids';

    protected $primaryKey = 'bid_id';

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
        return $this->belongsTo(Auction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

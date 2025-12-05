<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    protected $table = 'auctions';

    protected $primaryKey = 'auction_id';

    public $incrementing = true;
    protected $keyType = 'int';


    protected $fillable = [
        'start_date',
        'end_date',
        'starting_bid',
        'current_highest_bid',
        'status',
        'artwork_id',
    ];

    public function artwork()
    {
        return $this->belongsTo(Artwork::class);
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}

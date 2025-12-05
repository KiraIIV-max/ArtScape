<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    public const STATUS_ACTIVE = 'active';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_ENDED = 'ended';
    public const STATUS_PENDING = 'pending';

    protected $table = 'auctions';

    protected $primaryKey = 'auction_id';

    public $incrementing = true;
    protected $keyType = 'int';


    protected $fillable = [
        'artwork_id',
        'starting_bid',
        'current_bid',
        'status',
        'start_date',
        'end_date',
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

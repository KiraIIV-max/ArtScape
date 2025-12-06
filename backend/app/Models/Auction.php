<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    public const STATUS_ACTIVE = 'active';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_ENDED = 'ended';
    public const STATUS_PENDING = 'pending';

    protected  $table = 'auctions';
    protected  $primaryKey = 'id';
    public  $incrementing = true;
    protected  $keyType = 'int';

    protected  $fillable = [
        'artwork_id',
        'starting_bid',
        'current_highest_bid',
        'status',
        'start_date',
        'end_date',
    ];

    // FIX: ensures end_date + start_date are Carbon objects
    protected  $casts = [
        'start_date' => 'datetime',
        'end_date'   => 'datetime',
    ];

    public function artwork()
    {
        return  $this->belongsTo(Artwork::class, 'artwork_id');
    }

    public function bids()
    {
        return  $this->hasMany(Bid::class, 'auction_id');
    }

    public function payments()
    {
        return  $this->hasMany(Payment::class, 'auction_id');
    }
}

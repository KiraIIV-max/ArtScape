<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';

    // Defines the custom primary key
    protected $primaryKey = 'payment_id';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'amount',
        'payment_method',
        'payment_status',
        'user_id',
        'auction_id',
    ];

    /**
     * Get the auction associated with the payment.
     * Assumes the foreign key in the payments table is 'auction_id'.
     */
    public function auction()
    {
        return $this->belongsTo(Auction::class, 'auction_id');
    }

    /**
     * Get the user that made the payment.
     * Assumes the foreign key in the payments table is 'user_id'.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
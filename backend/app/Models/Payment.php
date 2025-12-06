<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';

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

    public function auction()
    {
        return $this->belongsTo(Auction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class); // relation stays even if we skip user model implementation
    }
}

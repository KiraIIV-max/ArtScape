<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'user_id';
    protected $fillable = [
        'name','email','password','phone','role','city','national_id','status'
    ];

    protected $hidden = ['password','remember_token'];
    protected $casts = ['email_verified_at' => 'datetime'];

    const ROLE_ADMIN = 'admin';
    const ROLE_ARTIST = 'artist';
    const ROLE_BUYER = 'buyer';

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    public function isAdmin(){ return $this->role === self::ROLE_ADMIN; }
    public function isArtist(){ return $this->role === self::ROLE_ARTIST; }
    public function isBuyer(){ return $this->role === self::ROLE_BUYER; }

    public function artistProfile()
    {
        return $this->hasOne(Artist::class, 'user_id', 'user_id');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class, 'user_id', 'user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id', 'user_id');
    }
}

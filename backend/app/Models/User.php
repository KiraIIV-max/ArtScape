<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    protected $table = 'users';

    protected $primaryKey = 'user_id';

    public $incrementing = true;
    protected $keyType = 'int';

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */

    // Role constants
    const ROLE_ADMIN = 'admin';
    const ROLE_ARTIST = 'artist';
    const ROLE_BUYER = 'buyer';

    // Artist approval status
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'city',
        'national_id',
        'status', // For artist approval status
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'created_at' => 'datetime',
    ];

    // Check if user is admin
    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }

    // Check if user is artist
    public function isArtist()
    {
        return $this->role === self::ROLE_ARTIST;
    }

    // Check if user is buyer
    public function isBuyer()
    {
        return $this->role === self::ROLE_BUYER;
    }

    // Check if artist is approved
    public function isApproved()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    // Relationships
    public function artworks()
    {
        return $this->hasMany(Artwork::class, 'artist_id', 'user_id');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class, 'user_id', 'user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id', 'user_id');
    }

    public function purchasedArtworks()
    {
        return $this->hasMany(Artwork::class, 'buyer_user_id', 'user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artist extends Model
{
    protected $table = 'artists';

    protected $primaryKey = 'artist_id';
    public $incrementing = true;
    protected $keyType = 'int';

    // Disable timestamps if your table doesn't have created_at and updated_at
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'name',
        'bio',
        'portfolio_url',
        'verification_status',
        'country',
        'birth_date',
    ];

    // Optional: cast birth_date as date
    protected $casts = [
        'birth_date' => 'date',
    ];

    // Optional: set default verification status
    protected $attributes = [
        'verification_status' => 'pending',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function artworks()
    {
        return $this->hasMany(Artwork::class, 'artist_id', 'artist_id');
    }
}

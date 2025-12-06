<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artwork extends Model
{
    public const STATUS_APPROVED = 'approved';
    public const STATUS_PENDING = 'pending';
    public const STATUS_REJECTED = 'rejected';

    protected $table = 'artworks';

    protected $primaryKey = 'artwork_id'; // Changed back to 'artwork_id'

    public $incrementing = true;
    protected $keyType = 'int';

    public $timestamps = true;

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'starting_price',
        'artist_id',
        'category_id',
        'status',
    ];

    // Relationship with Artist
    public function artist()
    {
        return $this->belongsTo(Artist::class, 'artist_id', 'artist_id');
    }

    // Relationship with Category
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    // Relationship with Auction
    public function auction()
    {
        return $this->hasOne(Auction::class, 'artwork_id', 'artwork_id');
    }

    // Relationship with Tags
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'artwork_tags', 'artwork_id', 'tag_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artwork extends Model
{
    public const STATUS_APPROVED = 'approved';
    public const STATUS_PENDING = 'pending';
    public const STATUS_REJECTED = 'rejected';

    protected $table = 'artworks';

    protected $primaryKey = 'id'; // Changed from 'artwork_id' to 'id'

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'starting_price',
        'artist_id',
        'category_id',
        'status',
    ];

    public function artist()
    {
        return $this->belongsTo(Artist::class, 'artist_id', 'artist_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'categorie_id');
    }

    public function auction()
    {
        return $this->hasOne(Auction::class, 'artwork_id', 'id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'artwork_tags', 'artwork_id', 'tag_id');
    }
}

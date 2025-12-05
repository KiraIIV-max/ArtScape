<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artwork extends Model
{
    public const STATUS_APPROVED = 'approved';
    public const STATUS_PENDING = 'pending';
    public const STATUS_REJECTED = 'rejected';

    protected $table = 'artworks';

    protected $primaryKey = 'artwork_id';

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
        return $this->belongsTo(Artist::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'categorie_id');
    }

    public function auction()
    {
        return $this->hasOne(Auction::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'artwork_tags');
    }
}

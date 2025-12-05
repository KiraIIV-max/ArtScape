<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artwork extends Model
{
    protected $table = 'artworks';

    protected $primaryKey = 'artwork_id';

    public $incrementing = true;
    protected $keyType = 'int';


    protected $fillable = [
        'title',
        'description',
        'image_url',
        'starting_price',
        'created_at',
        'buyer_user_id',
        'artist_id',
        'categorie_id',
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

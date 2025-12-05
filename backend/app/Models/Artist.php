<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Artist extends Model
{
    protected $table = 'artists';

    protected $primaryKey = 'artist_id';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'bio',
        'country',
        'birth_date',
    ];

    public function artworks()
    {
        return $this->hasMany(Artwork::class, 'artist_id', 'artist_id');
    }
}

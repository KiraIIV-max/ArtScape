<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $table = 'tags';

    protected $primaryKey = 'tag_id';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = ['name'];

    public function artworks()
    {
        return $this->belongsToMany(Artwork::class, 'artwork_tags');
    }
}

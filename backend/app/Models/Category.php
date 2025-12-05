<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';

    protected $primaryKey = 'categorie_id';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = ['name'];

    public function artworks()
    {
        return $this->hasMany(Artwork::class, 'categorie_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';

    protected $primaryKey = 'category_id';

    public $incrementing = true;
    public $timestamps = true;

    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'description',
    ];

    public function artworks()
    {
        return $this->hasMany(Artwork::class, 'category_id', 'category_id');
    }
}

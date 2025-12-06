<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::create('artwork_tags', function (Blueprint $table) {
        $table->id();
        $table->foreignId('artwork_id')->constrained('artworks')->onDelete('cascade');
        $table->foreignId('tag_id')->constrained('tags', 'tag_id')->onDelete('cascade');
        $table->timestamps();
    });
}
};

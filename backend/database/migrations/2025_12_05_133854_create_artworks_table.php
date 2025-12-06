<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artworks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_url');
            $table->decimal('starting_price', 10, 2);
            $table->foreignId('artist_id')->constrained('artists', 'artist_id')->onDelete('cascade');
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories', 'categorie_id')
                ->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artworks');
    }
};

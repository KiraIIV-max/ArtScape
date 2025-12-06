<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artworks', function (Blueprint $table) {
            $table->id('artwork_id');
            $table->foreignId('artist_id')->constrained('artists', 'artist_id')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('image_url');
            $table->decimal('starting_price', 10, 2);
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->foreign('category_id')->references('category_id')->on('categories')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artworks');
    }
};

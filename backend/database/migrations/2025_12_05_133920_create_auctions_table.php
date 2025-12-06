<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id('auction_id');
            $table->unsignedBigInteger('artwork_id');
            $table->decimal('starting_bid', 10, 2);
            $table->decimal('current_bid', 10, 2)->nullable();
            $table->string('status')->default('pending');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->timestamps();

            $table->foreign('artwork_id')->references('artwork_id')->on('artworks')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};

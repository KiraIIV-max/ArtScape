<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bids', function (Blueprint $table) {
            $table->id('bid_id');
            $table->unsignedBigInteger('auction_id');
            $table->unsignedBigInteger('user_id');
            $table->decimal('bid_amount', 10, 2);
            $table->dateTime('bid_time');
            $table->timestamps();

            $table->foreign('auction_id')->references('auction_id')->on('auctions')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bids');
    }
};

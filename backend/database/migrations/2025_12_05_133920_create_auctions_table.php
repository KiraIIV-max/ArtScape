<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::create('auctions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('artwork_id')->constrained('artworks')->onDelete('cascade');
        $table->dateTime('start_date');
        $table->dateTime('end_date');
        $table->decimal('starting_bid', 10, 2);
        $table->decimal('current_highest_bid', 10, 2)->nullable();
        $table->string('status', 20)->default('active');
        $table->timestamps();
    });
}
};

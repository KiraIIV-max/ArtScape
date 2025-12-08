<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::create('payments', function (Blueprint $table) {
        $table->id('payment_id');
        $table->decimal('amount', 10, 2);
        $table->string('payment_method', 15)->nullable();
        $table->string('payment_status', 20)->default('pending');
        $table->foreignId('user_id')->nullable()->constrained('users', 'user_id')->onDelete('set null');
        $table->foreignId('auction_id')->unique() ->constrained('auctions') ->onDelete('cascade');
        $table->timestamps();
    });
}
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::create('artists', function (Blueprint $table) {
        $table->id('artist_id');
        $table->string('name', 100);
        $table->text('bio')->nullable();
        $table->string('country', 100)->nullable();
        $table->date('birth_date')->nullable();
        $table->timestamps();
    });
}
};

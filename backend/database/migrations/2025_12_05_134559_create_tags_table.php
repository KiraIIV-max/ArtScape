<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::create('tags', function (Blueprint $table) {
        $table->id('tag_id');
        $table->string('name', 30);
        $table->timestamps();
    });
}
};

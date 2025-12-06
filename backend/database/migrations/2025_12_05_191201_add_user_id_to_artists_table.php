<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('artists', function (Blueprint $table) {
            if (!Schema::hasColumn('artists', 'user_id')) {
                $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade')->after('artist_id');
            }
            if (!Schema::hasColumn('artists', 'verification_status')) {
                $table->string('verification_status')->default('pending')->after('bio');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('artists', function (Blueprint $table) {
            if (Schema::hasColumn('artists', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
            if (Schema::hasColumn('artists', 'verification_status')) {
                $table->dropColumn('verification_status');
            }
        });
    }
};

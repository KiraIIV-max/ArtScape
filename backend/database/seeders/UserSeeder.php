<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // حساب Buyer تجريبي
        User::updateOrCreate(
            ['email' => 'buyer@artscape.com'],
            [
                'name' => 'Test Buyer',
                'password' => Hash::make('buyer123'),
                'role' => 'buyer',
                'city' => 'Cairo',
                'national_id' => '1111111111',
                'email_verified_at' => now(),
            ]
        );

        // حساب Artist تجريبي
        User::updateOrCreate(
            ['email' => 'artist@artscape.com'],
            [
                'name' => 'Test Artist',
                'password' => Hash::make('artist123'),
                'role' => 'artist',
                'city' => 'Giza',
                'national_id' => '2222222222',
                'email_verified_at' => now(),
            ]
        );
    }
}

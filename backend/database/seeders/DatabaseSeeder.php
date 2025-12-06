<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create categories
        Category::create(['name' => 'Painting', 'description' => 'Paintings and drawings']);
        Category::create(['name' => 'Sculpture', 'description' => 'Sculptures and statues']);
        Category::create(['name' => 'Photography', 'description' => 'Photographs']);
        Category::create(['name' => 'Digital Art', 'description' => 'Digital artworks']);
        Category::create(['name' => 'Printmaking', 'description' => 'Prints and engravings']);

        $this->call([
            AdminSeeder::class,
            UserSeeder::class, // ده بيضيف Buyer + Artist مع بعض
        ]);
    }
}

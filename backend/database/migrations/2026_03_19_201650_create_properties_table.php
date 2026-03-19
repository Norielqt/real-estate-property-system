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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['house', 'apartment', 'condo', 'villa', 'studio', 'land', 'commercial']);
            $table->enum('listing_type', ['sale', 'rent'])->default('sale');
            $table->decimal('price', 12, 2);
            $table->string('address');
            $table->string('city');
            $table->string('state');
            $table->string('country')->default('Philippines');
            $table->string('zip_code')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('bedrooms')->default(0);
            $table->integer('bathrooms')->default(0);
            $table->decimal('area_sqft', 10, 2)->nullable();
            $table->integer('parking_spots')->default(0);
            $table->boolean('is_furnished')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['available', 'sold', 'rented', 'pending'])->default('available');
            $table->string('cover_image')->nullable();
            $table->json('amenities')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};

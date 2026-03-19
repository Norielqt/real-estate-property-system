<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\PropertyController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Properties - public read, optional auth for favorited flag
Route::middleware('auth:sanctum')->get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/public', [PropertyController::class, 'index']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);

// Bookings - allow guest booking
Route::post('/properties/{propertyId}/bookings', [BookingController::class, 'store'])
    ->middleware('auth:sanctum');

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Properties management
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::put('/properties/{id}', [PropertyController::class, 'update']);
    Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);
    Route::get('/my-listings', [PropertyController::class, 'myListings']);
    Route::delete('/property-images/{imageId}', [PropertyController::class, 'deleteImage']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{propertyId}', [FavoriteController::class, 'toggle']);

    // Bookings
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);
    Route::get('/owner-bookings', [BookingController::class, 'ownerIndex']);
    Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
});

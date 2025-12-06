<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\ArtworkController;
use App\Http\Controllers\AuctionController;
use App\Http\Controllers\BidController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TagController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'getDashboardStats']);

        Route::get('/users', [AdminController::class, 'listUsers']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

        Route::get('/artists/pending', [AdminController::class, 'getPendingArtists']);
        Route::post('/artists/{id}/approve', [AdminController::class, 'approveArtist']);
        Route::post('/artists/{id}/reject', [AdminController::class, 'rejectArtist']);

        Route::get('/artworks', [AdminController::class, 'listArtworks']);
        Route::get('/artworks/pending', [AdminController::class, 'getPendingArtworks']);
        Route::post('/artworks/{id}/approve', [AdminController::class, 'approveArtwork']);
        Route::post('/artworks/{id}/reject', [AdminController::class, 'rejectArtwork']);
        Route::delete('/artworks/{id}', [AdminController::class, 'deleteArtwork']);
    });
});

Route::apiResource('artworks', ArtworkController::class);
Route::apiResource('auctions', AuctionController::class);
Route::get('auctions/{id}/winner', [AuctionController::class, 'winner']);

Route::get('auctions/{auction}/bids', [BidController::class, 'index']);
Route::middleware(['auth:sanctum'])->post('bids', [BidController::class, 'store']);

Route::apiResource('payments', PaymentController::class);
Route::apiResource('tags', TagController::class);
Route::post('artworks/{id}/tags', [TagController::class, 'assignToArtwork']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/artist/artworks', [ArtistController::class, 'createArtwork']);
    Route::get('/artist/artworks', [ArtistController::class, 'listArtworks']);
    Route::put('/artist/artworks/{artworkId}', [ArtistController::class, 'updateArtwork']);
    Route::delete('/artist/artworks/{artworkId}', [ArtistController::class, 'deleteArtwork']);

    // FIXED: Model-binding friendly parameter name
    Route::post('/auctions/{auction}/extend', [ArtistController::class, 'extendAuction']);
    Route::get('/auctions/{auction}/winner', [ArtistController::class, 'getWinner']);
});

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


Route::post(uri: '/register', action: [AuthController::class, 'register']);
Route::post(uri: '/login', action: [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
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

Route::apiResource('tasks',TaskController::class);
Route::apiResource('artists', ArtistController::class);
Route::apiResource('artworks', ArtworkController::class);
Route::apiResource('auctions', AuctionController::class);
Route::get('auctions/{id}/winner', [AuctionController::class, 'winner']);


Route::get('auctions/{auctionId}/bids', [BidController::class, 'index']);
Route::post('bids', [BidController::class, 'store']);

Route::apiResource('payments', PaymentController::class);
Route::apiResource('tags', TagController::class);
Route::post('artworks/{id}/tags', [TagController::class, 'assignToArtwork']);



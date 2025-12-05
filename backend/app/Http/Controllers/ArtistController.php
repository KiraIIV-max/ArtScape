<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Artwork;
use App\Models\Auction;
use App\Models\User;
use Illuminate\Http\Request;

class ArtistController extends Controller
{
    // Create artwork (only approved artists)
    public function createArtwork(Request $request)
    {
        $user = auth()->user();
        $artist = Artist::where('user_id', $user->user_id)->firstOrFail();

        if ($artist->verification_status !== 'approved') {
            return response()->json(['message' => 'Only approved artists can create artworks'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'required|url',
            'starting_price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,category_id',
        ]);

        $artwork = Artwork::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image_url' => $validated['image_url'],
            'starting_price' => $validated['starting_price'],
            'artist_id' => $artist->artist_id,
            'category_id' => $validated['category_id'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Artwork created. Awaiting admin approval.',
            'artwork' => $artwork,
        ], 201);
    }

    // List all artworks for authenticated artist (including pending)
    public function listArtworks()
    {
        $user = auth()->user();
        $artist = Artist::where('user_id', $user->user_id)->firstOrFail();

        $artworks = Artwork::where('artist_id', $artist->artist_id)->get();

        return response()->json([
            'message' => 'Your artworks',
            'artworks' => $artworks,
        ]);
    }

    // Update artwork
    public function updateArtwork(Request $request, $artworkId)
    {
        $user = auth()->user();
        $artist = Artist::where('user_id', $user->user_id)->firstOrFail();

        $artwork = Artwork::where('artwork_id', $artworkId)
                          ->where('artist_id', $artist->artist_id)
                          ->firstOrFail();

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'image_url' => 'url',
            'starting_price' => 'numeric|min:0',
        ]);

        $artwork->update($validated);

        return response()->json([
            'message' => 'Artwork updated.',
            'artwork' => $artwork,
        ]);
    }

    // Delete artwork
    public function deleteArtwork($artworkId)
    {
        $user = auth()->user();
        $artist = Artist::where('user_id', $user->user_id)->firstOrFail();

        $artwork = Artwork::where('artwork_id', $artworkId)
                          ->where('artist_id', $artist->artist_id)
                          ->firstOrFail();

        $artwork->delete();

        return response()->json(['message' => 'Artwork deleted']);
    }

    // Extend auction time (only before auction end)
    public function extendAuction(Request $request, $auctionId)
    {
        $user = auth()->user();
        $artist = Artist::where('user_id', $user->user_id)->firstOrFail();

        $auction = Auction::with('artwork')
                         ->where('auction_id', $auctionId)
                         ->whereHas('artwork', function ($q) use ($artist) {
                             $q->where('artist_id', $artist->artist_id);
                         })
                         ->firstOrFail();

        if (now() >= $auction->end_date) {
            return response()->json(['message' => 'Cannot extend auction after end time'], 400);
        }

        $validated = $request->validate([
            'hours' => 'required|integer|min:1|max:72',
        ]);

        $auction->end_date = $auction->end_date->addHours($validated['hours']);
        $auction->save();

        return response()->json([
            'message' => 'Auction extended successfully.',
            'auction' => $auction,
        ]);
    }

    // View winner bidder (only after auction end)
    public function getWinner($auctionId)
    {
        $user = auth()->user();
        $artist = Artist::where('user_id', $user->user_id)->firstOrFail();

        $auction = Auction::with('artwork', 'bids')
                         ->where('auction_id', $auctionId)
                         ->whereHas('artwork', function ($q) use ($artist) {
                             $q->where('artist_id', $artist->artist_id);
                         })
                         ->firstOrFail();

        if (now() < $auction->end_date) {
            return response()->json(['message' => 'Auction not ended yet'], 400);
        }

        $winner = $auction->bids()->orderBy('bid_amount', 'desc')->first();

        if (!$winner) {
            return response()->json(['message' => 'No bids placed'], 404);
        }

        $winnerUser = User::find($winner->user_id);

        return response()->json([
            'message' => 'Auction winner',
            'winner' => [
                'user_id' => $winnerUser->user_id,
                'name' => $winnerUser->name,
                'email' => $winnerUser->email,
                'city' => $winnerUser->city,
                'bid_amount' => $winner->bid_amount,
            ],
        ]);
    }
}

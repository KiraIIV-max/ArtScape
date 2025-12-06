<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\Request;

class BuyerController extends Controller
{
    // Get all approved artworks (visible to buyers) with pagination
    public function browseArtworks(Request $request)
    {
        $query = Artwork::where('status', 'approved')
                        ->with('artist', 'category', 'tags', 'auction');

        // Filter by artist name
        if ($request->has('artist')) {
            $query->whereHas('artist.user', function ($q) {
                $q->where('name', 'like', '%' . request('artist') . '%');
            });
        }

        // Filter by tags
        if ($request->has('tags')) {
            $tags = explode(',', $request->tags);
            $query->whereHas('tags', function ($q) use ($tags) {
                $q->whereIn('tags.tag_id', $tags);
            });
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('starting_price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('starting_price', '<=', $request->max_price);
        }

        // Search by title
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $artworks = $query->paginate(12);

        return response()->json([
            'message' => 'Approved artworks',
            'data' => $artworks,
        ]);
    }

    // Get single approved artwork details
    public function showArtwork($artworkId)
    {
        $artwork = Artwork::where('artwork_id', $artworkId)
                         ->where('status', 'approved')
                         ->with('artist.user', 'category', 'tags', 'auction')
                         ->firstOrFail();

        return response()->json([
            'message' => 'Artwork details',
            'artwork' => $artwork,
        ]);
    }

    // Get bid history for an artwork (public - no auth required)
    public function getArtworkBidHistory($artworkId)
    {
        $artwork = Artwork::where('artwork_id', $artworkId)
                         ->where('status', 'approved')
                         ->firstOrFail();

        $auction = Auction::where('artwork_id', $artworkId)->firstOrFail();

        $bids = Bid::where('auction_id', $auction->auction_id)
                   ->with('user')
                   ->orderBy('bid_time', 'desc')
                   ->get();

        return response()->json([
            'message' => 'Bid history for artwork',
            'artwork_id' => $artworkId,
            'auction_id' => $auction->auction_id,
            'current_bid' => $auction->current_bid,
            'bid_count' => count($bids),
            'bids' => $bids->map(function ($bid) {
                return [
                    'bid_id' => $bid->bid_id,
                    'bidder' => $bid->user->name,
                    'bid_amount' => $bid->bid_amount,
                    'bid_time' => $bid->bid_time,
                ];
            }),
        ]);
    }

    // Get artworks by specific artist
    public function getArtworksByArtist($artistId)
    {
        $artworks = Artwork::where('artist_id', $artistId)
                          ->where('status', 'approved')
                          ->with('artist.user', 'category', 'tags', 'auction')
                          ->paginate(12);

        return response()->json([
            'message' => 'Artworks by artist',
            'artworks' => $artworks,
        ]);
    }

    // Get artworks by category
    public function getArtworksByCategory($categoryId)
    {
        $artworks = Artwork::where('category_id', $categoryId)
                          ->where('status', 'approved')
                          ->with('artist.user', 'category', 'tags', 'auction')
                          ->paginate(12);

        return response()->json([
            'message' => 'Artworks by category',
            'artworks' => $artworks,
        ]);
    }

    // Advanced search with multiple filters
    public function searchArtworks(Request $request)
    {
        $query = Artwork::where('status', 'approved');

        if ($request->has('title')) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('min_price')) {
            $query->where('starting_price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('starting_price', '<=', $request->max_price);
        }

        if ($request->has('artist_id')) {
            $query->where('artist_id', $request->artist_id);
        }

        $artworks = $query->with('artist.user', 'category', 'tags', 'auction')
                         ->paginate(12);

        return response()->json([
            'message' => 'Search results',
            'artworks' => $artworks,
        ]);
    }

    // Get trending artworks (most bids)
    public function getTrendingArtworks()
    {
        $artworks = Artwork::where('status', 'approved')
                          ->with('artist.user', 'category', 'auction')
                          ->withCount('auction.bids')
                          ->orderByDesc('auction_bids_count')
                          ->limit(12)
                          ->get();

        return response()->json([
            'message' => 'Trending artworks',
            'artworks' => $artworks,
        ]);
    }
}

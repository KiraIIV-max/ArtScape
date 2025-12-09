<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class AuctionController extends Controller
{
    public function index()
    {
        // Only return auctions whose artwork has been approved.
        // Artworks must be approved by an admin before their auctions are visible to buyers.
        $auctions = Auction::with(['artwork.tags', 'artwork', 'bids.user'])
            ->whereHas('artwork', function ($q) {
                $q->where('status', 'approved');
            })->get();

        // Minimal Change: Iterate and update status if time has passed
        $auctions->each(function ($auction) {
            if ($auction->status === 'active' && now()->greaterThan($auction->end_date)) {
                $auction->update(['status' => 'ended']);
            }
        });

        return response()->json($auctions);
    }

    public function show($id)
    {
        $auction = Auction::with(['artwork.tags', 'artwork', 'bids.user'])->findOrFail($id);

        // Minimal Change: Update status if time has passed before showing
        if ($auction->status === 'active' && now()->greaterThan($auction->end_date)) {
            $auction->update(['status' => 'ended']);
        }

        return response()->json($auction);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'starting_bid' => 'required|numeric|min:0',
            'artwork_id' => 'required|exists:artworks,id',
        ]);

        // If the artwork is not yet approved, keep the auction in 'pending' state
        $artwork = \App\Models\Artwork::find($validated['artwork_id']);
        $initialStatus = 'pending';
        if ($artwork && $artwork->status === 'approved') {
            $initialStatus = now()->greaterThan($validated['end_date']) ? 'ended' : 'active';
        }

        $auction = Auction::create([
            'artwork_id' => $validated['artwork_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'starting_bid' => $validated['starting_bid'],
            'current_highest_bid' => null,
            'status' => $initialStatus,
        ]);

        return response()->json($auction, 201);
    }

    public function update(Request $request, $id)
    {
        $auction = Auction::findOrFail($id);

        if ($request->has('end_date')) {
            $auction->update(['end_date' => $request->end_date]);
            
            // Optional: If date is extended into the future, reactivate the auction
            if (now()->lessThan($request->end_date) && $auction->status === 'ended') {
                $auction->update(['status' => 'active']);
            }
        }

        return response()->json($auction);
    }

    public function destroy($id)
    {
        Auction::destroy($id);
        return response()->json(['message' => 'Auction deleted']);
    }

    public function winner($id)
    {
        $auction = Auction::with('bids.user')->findOrFail($id);

        if (now()->lessThan($auction->end_date)) {
            return response()->json(['message' => 'Auction not ended yet']);
        }

        $winner = $auction->bids()->with('user')->orderByDesc('amount')->first();
        return response()->json($winner);
    }
}
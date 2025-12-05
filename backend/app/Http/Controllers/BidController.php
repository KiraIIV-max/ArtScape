<?php

namespace App\Http\Controllers;

use App\Models\Bid;
use App\Models\Auction;
use Illuminate\Http\Request;

class BidController extends Controller
{
    // Show all bids for an artwork's auction
    public function index($auctionId)
    {
        $bids = Bid::where('auction_id', $auctionId)->orderByDesc('amount')->get();
        return response()->json($bids);
    }

    // Place a new bid
    public function store(Request $request)
    {
        $validated = $request->validate([
            'auction_id' => 'required|exists:auctions,auction_id',
            'user_id' => 'required|exists:users,user_id',
            'amount' => 'required|numeric|min:0',
        ]);

        $auction = Auction::findOrFail($validated['auction_id']);

        // Check auction time validity
        if (now()->lt($auction->start_date) || now()->gte($auction->end_date)) {
            return response()->json(['message' => 'Auction not active'], 400);
        }

        // Check bid increment rule ($10 higher than current)
        $minBid = $auction->current_highest_bid ?? $auction->starting_bid;
        if ($validated['amount'] < $minBid + 10) {
            return response()->json(['message' => 'Bid must be at least $10 higher'], 400);
        }

        // Save bid
        $bid = Bid::create([
            'auction_id' => $validated['auction_id'],
            'user_id' => $validated['user_id'],
            'amount' => $validated['amount'],
            'bid_time' => now(),
        ]);

        // Update auction highest bid
        $auction->update(['current_highest_bid' => $validated['amount']]);

        return response()->json($bid, 201);
    }
}

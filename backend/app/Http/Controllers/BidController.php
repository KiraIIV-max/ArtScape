<?php

namespace App\Http\Controllers;

use App\Models\Bid;
use App\Models\Auction;
use Illuminate\Http\Request;


class BidController extends Controller
{
    public function index( $auctionId)
    {
        return response()->json(
            Bid::where('auction_id',  $auctionId)
               ->orderBy('amount', 'desc')
               ->get()
        );
    }

    public function store(Request  $request)
    {
         $validated =  $request->validate([
            'auction_id' => 'required|exists:auctions,id',
            'amount' => 'required|numeric|min:0',
        ]);

        if (!auth()->user()->isBuyer()) {
            return response()->json(['message' => 'Only buyers can place bids'], 403);
        }

        $auction = Auction::findOrFail( $validated['auction_id']);

        if (now()->lt($auction->start_date) || now()->gte( $auction->end_date)) {
            return response()->json(['message' => 'Auction not active'], 400);
        }

         $minBid =  $auction->current_highest_bid ??  $auction->starting_bid;
        if ( $validated['amount'] <  $minBid + 10) {
            return response()->json(['message' => 'Bid must be at least  $10 higher'], 400);
        }

         $bid = Bid::create([
            'auction_id' =>  $validated['auction_id'],
            'user_id' => auth()->id(),
            'amount' =>  $validated['amount'],
            'bid_time' => now(),
        ]);

         $auction->update(['current_highest_bid' =>  $validated['amount']]);

        return response()->json( $bid, 201);
    }
}

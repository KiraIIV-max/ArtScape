<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Auction;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate the incoming request
        $validated = $request->validate([
            'payment_method' => 'required|string|max:255',
            'user_id'        => 'required|integer', 
            'auction_id'     => 'required|exists:auctions,id',
        ]);

        // 2. Fetch the Auction
        $auction = Auction::findOrFail($validated['auction_id']);

        // 3. CHECK STATUS: Ensure auction is not 'active'
        // Users should only pay after the auction ends.
        if ($auction->status === 'active') {
            return response()->json(['message' => 'Auction is still active. Payment not allowed yet.'], 400);
        }

        // 4. FIND THE WINNER
        // Since we can't change the model, we query the bids relationship right here.
        // We assume your 'bids' table has an 'amount' column. 
        // If your column is named 'bid_amount', change 'amount' to 'bid_amount' below.
        $winningBid = $auction->bids()->orderBy('amount', 'desc')->first();

        // Check if there are any bids at all
        if (!$winningBid) {
            return response()->json(['message' => 'No bids found for this auction.'], 400);
        }

        // 5. SECURITY CHECK: Ensure the user trying to pay is actually the winner
        if ($winningBid->user_id != $validated['user_id']) {
            return response()->json(['message' => 'Unauthorized. Only the auction winner can make the payment.'], 403);
        }

        // 6. CHECK FOR EXISTING PAYMENT
        $exists = Payment::where('auction_id', $auction->id)->exists();
        if ($exists) {
            return response()->json(['message' => 'Payment for this auction has already been processed.'], 409);
        }

        // 7. PROCESS PAYMENT
        // We take the amount strictly from the auction table, ignoring user input for security.
        $payment = Payment::create([
            'auction_id'     => $validated['auction_id'],
            'user_id'        => $validated['user_id'],
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'paid',
            'amount'         => $auction->current_highest_bid, 
        ]);

        // 8. CLOSE THE AUCTION
        $auction->update(['status' => 'closed']);

        return response()->json([
            'message' => 'Payment successful',
            'data' => $payment
        ], 201);
    }
}
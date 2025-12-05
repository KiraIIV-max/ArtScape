<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;

class AuctionController extends Controller
{
    public function index()
    {
        return response()->json(Auction::with('artwork')->get());
    }

    public function show($id)
    {
        return response()->json(Auction::with(['artwork', 'bids'])->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'starting_bid' => 'required|numeric|min:0',
            'artwork_id' => 'required|exists:artworks,artwork_id',
        ]);

        $auction = Auction::create($validated);
        return response()->json($auction, 201);
    }

    public function update(Request $request, $id)
    {
        $auction = Auction::findOrFail($id);

        // Example: extend auction time
        if ($request->has('end_date')) {
            $auction->update(['end_date' => $request->end_date]);
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
        $auction = Auction::with('bids')->findOrFail($id);

        if (now()->lessThan($auction->end_date)) {
            return response()->json(['message' => 'Auction not ended yet']);
        }

        $winner = $auction->bids()->orderByDesc('amount')->first();
        return response()->json($winner);
    }
}

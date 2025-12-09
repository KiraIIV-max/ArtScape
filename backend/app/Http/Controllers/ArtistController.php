<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Artwork;
use App\Models\Auction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;


class ArtistController extends Controller
{
    public function createArtwork(Request  $request)
    {
         $user = auth()->user();
         $artist = Artist::where('user_id',  $user->user_id)->firstOrFail();

        if ( $artist->verification_status !== 'approved') {
            return response()->json(['message' => 'Only approved artists can create artworks'], 403);
        }

         $validated =  $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'nullable|url',
            'image' => 'nullable|image|max:2048',
            'starting_price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,categorie_id',
            'auction_start' => 'required|date',
            'auction_end' => 'required|date|after:auction_start',
        ]);

        DB::beginTransaction();
        try {
            // Handle image upload if file provided
             $imageUrl =  $validated['image_url'] ?? null;
            if ( $request->hasFile('image')) {
                 $path =  $request->file('image')->store('artworks', 'public');
                 $imageUrl = asset('storage/' .  $path);
            }

            // Create artwork
             $artwork = Artwork::create([
                'title' =>  $validated['title'],
                'description' =>  $validated['description'],
                'image_url' =>  $imageUrl,
                'starting_price' =>  $validated['starting_price'],
                'artist_id' =>  $artist->artist_id,
                'category_id' =>  $validated['category_id'],
                'status' => 'pending',
            ]);

            // Create auction
             $auction = Auction::create([
                'artwork_id' =>  $artwork->id,
                'start_date' =>  $validated['auction_start'],
                'end_date' =>  $validated['auction_end'],
                'starting_bid' =>  $validated['starting_price'],
                'current_highest_bid' => null,
                'status' => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Artwork created. Awaiting approval.',
                'artwork' =>  $artwork->load('auctions'),
            ], 201);

        } catch (Exception  $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create artwork.',
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    public function listArtworks()
    {
         $artist = Artist::where('user_id', auth()->id())->firstOrFail();
        return response()->json( $artist->artworks()->with('auctions')->get());
    }

    public function updateArtwork(Request  $request,  $artworkId)
    {
         $artist = Artist::where('user_id', auth()->id())->firstOrFail();

         $artwork = Artwork::where('id',  $artworkId)
                          ->where('artist_id',  $artist->artist_id)
                          ->firstOrFail();

         $validated =  $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
            'image' => 'nullable|image|max:2048',
            'starting_price' => 'nullable|numeric|min:0',
            'auction_end' => 'nullable|date|after:now',
        ]);

        DB::beginTransaction();
        try {
            // Handle image upload if file provided
            if ( $request->hasFile('image')) {
                 $path =  $request->file('image')->store('artworks', 'public');
                 $validated['image_url'] = asset('storage/' .  $path);
                unset( $validated['image']);
            }

            // Update artwork
            $artwork->update(array_filter($validated, fn( $key) =>
                in_array( $key, ['title', 'description', 'image_url', 'starting_price']),
                ARRAY_FILTER_USE_KEY
            ));

            // Update auction end date if provided
            if (isset( $validated['auction_end'])) {
                 $auction =  $artwork->auctions()->first();
                if ($auction && in_array( $auction->status, ['active', 'pending'])) {
                     $auction->update(['end_date' =>  $validated['auction_end']]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Artwork updated',
                'artwork' =>  $artwork->load('auctions')
            ]);

        } catch (Exception  $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update artwork.',
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    public function deleteArtwork( $artworkId)
    {
         $artist = Artist::where('user_id', auth()->id())->firstOrFail();

         $artwork = Artwork::where('id',  $artworkId)
                          ->where('artist_id',  $artist->artist_id)
                          ->firstOrFail();

         $artwork->delete();

        return response()->json(['message' => 'Artwork deleted']);
    }

    public function extendAuction(Request  $request,  $auctionId)
    {
         $artist = Artist::where('user_id', auth()->id())->firstOrFail();

         $auction = Auction::with('artwork')
            ->where('id',  $auctionId)
            ->whereHas('artwork', fn( $q) =>  $q->where('artist_id',  $artist->artist_id))
            ->firstOrFail();

        if (now() >=  $auction->end_date) {
            return response()->json(['message' => 'Cannot extend auction after end time'], 400);
        }

         $validated =  $request->validate([
            'hours' => 'required|integer|min:1|max:72',
        ]);

         $auction->end_date = $auction->end_date->addHours( $validated['hours']);
         $auction->save();

        return response()->json(['message' => 'Auction extended', 'auction' =>  $auction]);
    }

    public function getWinner( $auctionId)
    {
         $artist = Artist::where('user_id', auth()->id())->firstOrFail();

         $auction = Auction::with('artwork', 'bids')
            ->where('id',  $auctionId)
            ->whereHas('artwork', fn( $q) =>  $q->where('artist_id',  $artist->artist_id))
            ->firstOrFail();

        if (now() <  $auction->end_date) {
            return response()->json(['message' => 'Auction not ended yet'], 400);
        }

         $winner =  $auction->bids()->orderBy('amount', 'desc')->first();

        if (! $winner) {
            return response()->json(['message' => 'No bids placed'], 404);
        }

        $winnerUser = User::find( $winner->user_id);

        return response()->json([
            'winner' => [
                'user_id' =>  $winnerUser->user_id,
                'name' =>  $winnerUser->name,
                'email' =>  $winnerUser->email,
                'city' =>  $winnerUser->city,
                'bid_amount' =>  $winner->amount,
            ]
        ]);
    }
}

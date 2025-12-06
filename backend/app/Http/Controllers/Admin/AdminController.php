<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Artist;
use App\Models\Artwork;
use App\Models\Auction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class AdminController extends Controller
{
    public function listUsers(Request  $request)
    {
         $query = User::query();

        if ( $request->has('role')) {
             $query->where('role',  $request->role);
        }

        if ( $request->has('status')) {
             $query->where('status',  $request->status);
        }

        if ( $request->has('search')) {
             $search =  $request->search;

            $query->where(function($q) use ( $search) {
                $q->where('name', 'like', "% $search%")
                  ->orWhere('email', 'like', "% $search%");
            });
        }

         $users =  $query->orderBy('created_at', 'desc')
                       ->paginate( $request->per_page ?? 15);

        return response()->json( $users);
    }

    public function getPendingArtists()
    {
         $pendingArtists = User::where('role', User::ROLE_ARTIST)
            ->where('status', User::STATUS_PENDING)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'count' =>  $pendingArtists->count(),
            'artists' =>  $pendingArtists
        ]);
    }

    public function approveArtist( $userId)
    {
         $user = User::where('user_id',  $userId)->firstOrFail();

        DB::beginTransaction();
        try {
             $user->status = User::STATUS_APPROVED;
             $user->save();

            Artist::updateOrCreate(
                ['user_id' =>  $user->user_id],
                [
                    'name' =>  $user->name,
                    'bio' => null,
                    'portfolio_url' => null,
                    'verification_status' => 'approved',
                ]
            );

            DB::commit();

            return response()->json([
                'message' => 'Artist approved successfully.',
                'user' =>  $user
            ]);

        } catch (Exception  $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to approve artist.',
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    public function rejectArtist( $userId)
    {
         $user = User::where('user_id',  $userId)
                    ->where('role', User::ROLE_ARTIST)
                    ->firstOrFail();

        DB::beginTransaction();
        try {
             $user->status = User::STATUS_REJECTED;
             $user->save();

            Artist::where('user_id',  $user->user_id)->delete();

            DB::commit();

            return response()->json(['message' => 'Artist registration rejected.']);

        } catch (Exception  $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to reject artist.',
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    public function deleteUser( $userId)
    {
         $user = User::where('user_id',  $userId)->firstOrFail();

        if ( $user->isAdmin()) {
            return response()->json(['message' => 'Cannot delete admin accounts.'], 403);
        }

        DB::beginTransaction();
        try {
            if ( $user->isArtist()) {
                 $artist =  $user->artistProfile;
                if ( $artist) {
                     $artworks =  $artist->artworks;

                    foreach ( $artworks as  $art) {
                        foreach ( $art->auction as  $auction) {
                             $auction->bids()->delete();
                             $auction->payments()->delete();
                             $auction->delete();
                        }

                         $art->tags()->detach();
                         $art->delete();
                    }

                     $artist->delete();
                }
            }

            if ( $user->isBuyer()) {
                 $user->bids()->delete();
                 $user->payments()->delete();
            }

             $user->delete();

            DB::commit();

            return response()->json(['message' => 'User deleted successfully.']);

        } catch (Exception  $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete user.',
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    public function getPendingArtworks()
    {
         $pendingArtworks = Artwork::with(['artist', 'category', 'tags'])
            ->where('status', Artwork::STATUS_PENDING)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'count' =>  $pendingArtworks->count(),
            'artworks' =>  $pendingArtworks
        ]);
    }

    public function listArtworks(Request  $request)
    {
         $query = Artwork::with(['artist', 'category', 'tags', 'auction']);

        if ( $request->has('status')) {
             $query->where('status',  $request->status);
        }

        if ( $request->has('artist_id')) {
             $query->where('artist_id',  $request->artist_id);
        }

        if ( $request->has('category_id')) {
             $query->where('category_id',  $request->category_id);
        }

        if ( $request->has('search')) {
             $search =  $request->search;

            $query->where(function($q) use ( $search) {
                $q->where('title', 'like', "% $search%")
                  ->orWhere('description', 'like', "% $search%");
            });
        }

         $artworks =  $query->orderBy('created_at', 'desc')
                          ->paginate( $request->per_page ?? 15);

        return response()->json( $artworks);
    }

    public function approveArtwork( $artworkId)
    {
        $artwork = Artwork::findOrFail( $artworkId);

        if ( $artwork->status === Artwork::STATUS_APPROVED) {
            return response()->json(['message' => 'Artwork is already approved.'], 400);
        }

         $artwork->update(['status' => Artwork::STATUS_APPROVED]);

        return response()->json([
            'message' => 'Artwork approved successfully.',
            'artwork' =>  $artwork->load(['artist', 'category', 'tags'])
        ]);
    }

    public function rejectArtwork( $artworkId)
    {
        $artwork = Artwork::findOrFail( $artworkId);
         $artwork->update(['status' => Artwork::STATUS_REJECTED]);

        return response()->json([
            'message' => 'Artwork rejected.',
            'artwork' =>  $artwork
        ]);
    }

public function deleteArtwork($artworkId)
{
    $artwork = Artwork::find($artworkId);

    if (!$artwork) {
        return response()->json(['message' => 'Artwork not found'], 404);
    }

    DB::beginTransaction();
    try {
        // Use correct relationship name: auctions()
        if ($artwork->auctions && $artwork->auctions->count() > 0) {
            foreach ($artwork->auctions as $auction) {
                if ($auction) {
                    $auction->bids()->delete();
                    $auction->payments()->delete();
                    $auction->delete();
                }
            }
        }

        $artwork->tags()->detach();
        $artwork->delete();

        DB::commit();

        return response()->json(['message' => 'Artwork deleted successfully.']);

    } catch (Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to delete artwork.',
            'error' => $e->getMessage()
        ], 500);
    }
}}

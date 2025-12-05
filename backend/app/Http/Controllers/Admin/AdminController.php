<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Artist;
use App\Models\Artwork;
use App\Models\Auction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function listUsers(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
                       ->paginate($request->per_page ?? 15);

        return response()->json($users);
    }

    public function getPendingArtists()
    {
        $pendingArtists = User::where('role', User::ROLE_ARTIST)
            ->where('status', User::STATUS_PENDING)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'count' => $pendingArtists->count(),
            'artists' => $pendingArtists
        ]);
    }

    public function approveArtist($userId)
    {
        $user = User::where('user_id', $userId)->firstOrFail();

        DB::beginTransaction();
        try {
            $user->status = 'approved';
            $user->save();

            // Create or update artist record with user's name
            $artist = Artist::updateOrCreate(
                ['user_id' => $user->user_id],
                [
                    'name' => $user->name,
                    'bio' => null,
                    'portfolio_url' => null,
                    'verification_status' => 'approved',
                ]
            );

            DB::commit();

            return response()->json([
                'message' => 'Artist approved successfully.',
                'user' => $user,
                'artist' => $artist
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to approve artist.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function rejectArtist($userId)
    {
        $user = User::where('user_id', $userId)
                    ->where('role', User::ROLE_ARTIST)
                    ->firstOrFail();

        DB::beginTransaction();
        try {
            $user->status = User::STATUS_REJECTED;
            $user->save();

            // Delete artist record if exists
            Artist::where('user_id', $user->user_id)->delete();

            DB::commit();

            return response()->json([
                'message' => 'Artist registration rejected.',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to reject artist.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteUser($userId)
    {
        $user = User::where('user_id', $userId)->firstOrFail();

        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Cannot delete admin accounts.'
            ], 403);
        }

        DB::beginTransaction();
        try {
            if ($user->isArtist()) {
                $artworkIds = $user->artworks()->pluck('artwork_id');

                Auction::whereIn('artwork_id', $artworkIds)->each(function($auction) {
                    $auction->bids()->delete();
                    $auction->payments()->delete();
                    $auction->delete();
                });

                $user->artworks()->delete();
            }

            if ($user->isBuyer()) {
                $user->bids()->delete();
                $user->payments()->delete();
            }

            $user->delete();
            DB::commit();

            return response()->json([
                'message' => 'User deleted successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete user.',
                'error' => $e->getMessage()
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
            'count' => $pendingArtworks->count(),
            'artworks' => $pendingArtworks
        ]);
    }

    public function listArtworks(Request $request)
    {
        $query = Artwork::with(['artist', 'category', 'tags', 'activeAuction']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('artist_id')) {
            $query->where('artist_id', $request->artist_id);
        }

        if ($request->has('category_id')) {
            $query->where('categorie_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $artworks = $query->orderBy('created_at', 'desc')
                          ->paginate($request->per_page ?? 15);

        return response()->json($artworks);
    }

    public function approveArtwork($artworkId)
    {
        $artwork = Artwork::where('artwork_id', $artworkId)->firstOrFail();

        if ($artwork->status === Artwork::STATUS_APPROVED) {
            return response()->json([
                'message' => 'Artwork is already approved.'
            ], 400);
        }

        $artwork->status = Artwork::STATUS_APPROVED;
        $artwork->save();

        return response()->json([
            'message' => 'Artwork approved successfully.',
            'artwork' => $artwork->load(['artist', 'category', 'tags'])
        ]);
    }

    public function rejectArtwork($artworkId)
    {
        $artwork = Artwork::where('artwork_id', $artworkId)->firstOrFail();

        $artwork->status = Artwork::STATUS_REJECTED;
        $artwork->save();

        return response()->json([
            'message' => 'Artwork rejected.',
            'artwork' => $artwork
        ]);
    }

    public function deleteArtwork($artworkId)
    {
        $artwork = Artwork::where('artwork_id', $artworkId)->firstOrFail();

        DB::beginTransaction();
        try {
            $artwork->auctions()->each(function($auction) {
                $auction->bids()->delete();
                $auction->payments()->delete();
                $auction->delete();
            });

            $artwork->tags()->detach();
            $artwork->delete();

            DB::commit();

            return response()->json([
                'message' => 'Artwork deleted successfully from the wall.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete artwork.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDashboardStats()
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'artists' => User::where('role', User::ROLE_ARTIST)->count(),
                'buyers' => User::where('role', User::ROLE_BUYER)->count(),
                'pending_artists' => User::where('role', User::ROLE_ARTIST)
                                         ->where('status', User::STATUS_PENDING)
                                         ->count(),
            ],
            'artworks' => [
                'total' => Artwork::count(),
                'approved' => Artwork::where('status', Artwork::STATUS_APPROVED)->count(),
                'pending' => Artwork::where('status', Artwork::STATUS_PENDING)->count(),
                'rejected' => Artwork::where('status', Artwork::STATUS_REJECTED)->count(),
            ],
            'auctions' => [
                'active' => Auction::where('status', Auction::STATUS_ACTIVE)->count(),
                'ended' => Auction::where('status', Auction::STATUS_ENDED)->count(),
            ],
            'recent_activity' => [
                'recent_users' => User::orderBy('created_at', 'desc')->take(5)->get(),
                'recent_artworks' => Artwork::with('artist')->orderBy('created_at', 'desc')->take(5)->get(),
            ]
        ];

        return response()->json($stats);
    }
}

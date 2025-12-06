<?php

namespace App\Http\Controllers\Admin;

use App\Models\Artist;
use App\Models\Artwork;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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

    // Approve artist registration
    public function approveArtist($userId)
    {
        $artist = Artist::where('user_id', $userId)->firstOrFail();

        if ($artist->verification_status === 'approved') {
            return response()->json(['message' => 'Artist already approved'], 400);
        }

        $artist->verification_status = 'approved';
        $artist->save();

        return response()->json([
            'message' => 'Artist approved successfully',
            'artist' => $artist,
        ]);
    }

    // Reject artist registration
    public function rejectArtist($userId)
    {
        $artist = Artist::where('user_id', $userId)->firstOrFail();

        $artist->verification_status = 'rejected';
        $artist->save();

        return response()->json([
            'message' => 'Artist rejected',
            'artist' => $artist,
        ]);
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

    // Approve artwork (makes it visible to buyers)
    public function approveArtwork($artworkId)
    {
        $artwork = Artwork::findOrFail($artworkId);

        if ($artwork->status === 'approved') {
            return response()->json(['message' => 'Artwork already approved'], 400);
        }

        $artwork->status = 'approved';
        $artwork->save();

        return response()->json([
            'message' => 'Artwork approved successfully',
            'artwork' => $artwork,
        ]);
    }

    // Reject artwork
    public function rejectArtwork($artworkId)
    {
        $artwork = Artwork::findOrFail($artworkId);

        $artwork->status = 'rejected';
        $artwork->save();

        return response()->json([
            'message' => 'Artwork rejected',
            'artwork' => $artwork,
        ]);
    }

    // Get pending artworks for moderation
    public function getPendingArtworks(Request $request)
    {
        $query = Artwork::where('status', 'pending');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $artworks = $query->with('artist', 'category')->paginate(15);

        return response()->json($artworks);
    }

    // Get pending artists for approval
    public function getPendingArtists()
    {
        $artists = Artist::where('verification_status', 'pending')
                        ->with('user')
                        ->paginate(15);

        return response()->json($artists);
    }

    // Dashboard statistics
    public function getDashboardStats()
    {
        return response()->json([
            'total_artists' => Artist::count(),
            'approved_artists' => Artist::where('verification_status', 'approved')->count(),
            'pending_artists' => Artist::where('verification_status', 'pending')->count(),
            'total_artworks' => Artwork::count(),
            'approved_artworks' => Artwork::where('status', 'approved')->count(),
            'pending_artworks' => Artwork::where('status', 'pending')->count(),
        ]);
    }
}

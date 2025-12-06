<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use Illuminate\Http\Request;

class ArtworkController extends Controller
{
    public function index(Request $request)
    {
        $query = Artwork::where('status', Artwork::STATUS_APPROVED);
        if ($request->has('artist_id')) {
            $query->where('artist_id', $request->artist_id);
        }

        if ($request->has('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('name', $request->tag);
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'required|string|max:255',
            'starting_price' => 'required|numeric|min:0',
            'artist_id' => 'required|exists:artists,artist_id',
            'categorie_id' => 'nullable|exists:categories,categorie_id',
        ]);

        $artwork = Artwork::create($validated);
        return response()->json($artwork, 201);
    }

    public function show($id)
    {
        return response()->json(Artwork::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);
        $artwork->update($request->all());
        return response()->json($artwork);
    }

    public function destroy($id)
    {
        Artwork::destroy($id);
        return response()->json(['message' => 'Artwork deleted']);
    }
}

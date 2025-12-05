<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use Illuminate\Http\Request;

class ArtistController extends Controller
{
    // List all artists
    public function index()
    {
        return response()->json(Artist::all());
    }

    // Show single artist
    public function show($id)
    {
        return response()->json(Artist::findOrFail($id));
    }

    // Create new artist
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'bio' => 'nullable|string',
            'country' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
        ]);

        $artist = Artist::create($validated);
        return response()->json($artist, 201);
    }

    // Update artist
    public function update(Request $request, $id)
    {
        $artist = Artist::findOrFail($id);
        $artist->update($request->all());
        return response()->json($artist);
    }

    // Delete artist
    public function destroy($id)
    {
        Artist::destroy($id);
        return response()->json(['message' => 'Artist deleted']);
    }
}


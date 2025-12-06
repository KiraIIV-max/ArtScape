<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Artwork;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        return response()->json(Tag::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:30',
        ]);

        $tag = Tag::create($validated);
        return response()->json($tag, 201);
    }

    public function show($id)
    {
        return response()->json(Tag::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $tag = Tag::findOrFail($id);
        $tag->update($request->all());
        return response()->json($tag);
    }

    public function destroy($id)
    {
        Tag::destroy($id);
        return response()->json(['message' => 'Tag deleted']);
    }

    // Attach tags to artwork
    public function assignToArtwork(Request $request, $artworkId)
    {
        $validated = $request->validate([
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'exists:tags,tag_id',
        ]);

        $artwork = Artwork::findOrFail($artworkId);
        $artwork->tags()->syncWithoutDetaching($validated['tag_ids']);

        return response()->json(['message' => 'Tags assigned successfully']);
    }
}

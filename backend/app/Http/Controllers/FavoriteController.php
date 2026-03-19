<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Property;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favoriteProperties()
            ->with(['images'])
            ->withCount('favorites')
            ->latest('favorites.created_at')
            ->paginate(12);

        return response()->json($favorites);
    }

    public function toggle(Request $request, $propertyId)
    {
        Property::findOrFail($propertyId);

        $existing = Favorite::where('user_id', $request->user()->id)
            ->where('property_id', $propertyId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['favorited' => false, 'message' => 'Removed from favorites.']);
        }

        Favorite::create([
            'user_id'     => $request->user()->id,
            'property_id' => $propertyId,
        ]);

        return response()->json(['favorited' => true, 'message' => 'Added to favorites.']);
    }
}

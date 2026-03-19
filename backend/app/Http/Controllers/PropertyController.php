<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with(['images', 'user:id,name,email'])
            ->withCount('favorites');

        // Filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('listing_type')) {
            $query->where('listing_type', $request->listing_type);
        }
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', '>=', $request->bedrooms);
        }
        if ($request->filled('bathrooms')) {
            $query->where('bathrooms', '>=', $request->bathrooms);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('address', 'like', '%' . $request->search . '%')
                  ->orWhere('city', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Geo bounding box for map
        if ($request->filled('bounds')) {
            $bounds = explode(',', $request->bounds); // sw_lat,sw_lng,ne_lat,ne_lng
            if (count($bounds) === 4) {
                $query->whereBetween('latitude', [(float) $bounds[0], (float) $bounds[2]])
                      ->whereBetween('longitude', [(float) $bounds[1], (float) $bounds[3]]);
            }
        }

        $properties = $query->latest()->paginate($request->get('per_page', 12));

        // Inject is_favorited flag for authenticated users
        if ($request->user()) {
            $favIds = $request->user()->favorites()->pluck('property_id')->toArray();
            $properties->getCollection()->transform(function ($p) use ($favIds) {
                $p->is_favorited = in_array($p->id, $favIds);
                return $p;
            });
        }

        return response()->json($properties);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'required|string',
            'type'           => 'required|in:house,apartment,condo,villa,studio,land,commercial',
            'listing_type'   => 'required|in:sale,rent',
            'price'          => 'required|numeric|min:0',
            'address'        => 'required|string',
            'city'           => 'required|string',
            'state'          => 'required|string',
            'country'        => 'nullable|string',
            'zip_code'       => 'nullable|string',
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
            'bedrooms'       => 'nullable|integer|min:0',
            'bathrooms'      => 'nullable|integer|min:0',
            'area_sqft'      => 'nullable|numeric|min:0',
            'parking_spots'  => 'nullable|integer|min:0',
            'is_furnished'   => 'nullable|boolean',
            'amenities'      => 'nullable|array',
            'cover_image'    => 'nullable|image|max:5120',
            'images.*'       => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')
                ->store('properties/covers', 'public');
        }

        $data['user_id'] = $request->user()->id;
        $property = Property::create($data);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $img) {
                $path = $img->store('properties/images', 'public');
                PropertyImage::create([
                    'property_id' => $property->id,
                    'path'        => $path,
                    'order'       => $index,
                ]);
            }
        }

        return response()->json($property->load(['images', 'user:id,name,email']), 201);
    }

    public function show(Request $request, $id)
    {
        $property = Property::with(['images', 'user:id,name,email'])
            ->withCount('favorites')
            ->findOrFail($id);

        if ($request->user()) {
            $property->is_favorited = $property->isFavoritedBy($request->user()->id);
        }

        return response()->json($property);
    }

    public function update(Request $request, $id)
    {
        $property = Property::findOrFail($id);

        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'title'         => 'sometimes|string|max:255',
            'description'   => 'sometimes|string',
            'type'          => 'sometimes|in:house,apartment,condo,villa,studio,land,commercial',
            'listing_type'  => 'sometimes|in:sale,rent',
            'price'         => 'sometimes|numeric|min:0',
            'address'       => 'sometimes|string',
            'city'          => 'sometimes|string',
            'state'         => 'sometimes|string',
            'country'       => 'nullable|string',
            'zip_code'      => 'nullable|string',
            'latitude'      => 'nullable|numeric',
            'longitude'     => 'nullable|numeric',
            'bedrooms'      => 'nullable|integer|min:0',
            'bathrooms'     => 'nullable|integer|min:0',
            'area_sqft'     => 'nullable|numeric|min:0',
            'parking_spots' => 'nullable|integer|min:0',
            'is_furnished'  => 'nullable|boolean',
            'is_featured'   => 'nullable|boolean',
            'status'        => 'nullable|in:available,sold,rented,pending',
            'amenities'     => 'nullable|array',
            'cover_image'   => 'nullable|image|max:5120',
            'images.*'      => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('cover_image')) {
            if ($property->cover_image) {
                Storage::disk('public')->delete($property->cover_image);
            }
            $data['cover_image'] = $request->file('cover_image')
                ->store('properties/covers', 'public');
        }

        $property->update($data);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $img) {
                $path = $img->store('properties/images', 'public');
                PropertyImage::create([
                    'property_id' => $property->id,
                    'path'        => $path,
                    'order'       => $property->images()->count() + $index,
                ]);
            }
        }

        return response()->json($property->load(['images', 'user:id,name,email']));
    }

    public function destroy(Request $request, $id)
    {
        $property = Property::findOrFail($id);

        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($property->cover_image) {
            Storage::disk('public')->delete($property->cover_image);
        }
        foreach ($property->images as $img) {
            Storage::disk('public')->delete($img->path);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted.']);
    }

    public function myListings(Request $request)
    {
        $properties = Property::with(['images'])
            ->where('user_id', $request->user()->id)
            ->withCount('favorites')
            ->latest()
            ->paginate(12);

        return response()->json($properties);
    }

    public function deleteImage(Request $request, $imageId)
    {
        $image = PropertyImage::findOrFail($imageId);
        $property = $image->property;

        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(['message' => 'Image deleted.']);
    }
}


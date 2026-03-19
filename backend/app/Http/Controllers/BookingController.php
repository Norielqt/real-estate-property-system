<?php

namespace App\Http\Controllers;

use App\Models\BookingRequest;
use App\Models\Property;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // Guest or user requests a booking / viewing
    public function store(Request $request, $propertyId)
    {
        Property::findOrFail($propertyId);

        $data = $request->validate([
            'check_in'  => 'required|date|after_or_equal:today',
            'check_out' => 'nullable|date|after:check_in',
            'full_name' => 'required|string|max:255',
            'email'     => 'required|email',
            'phone'     => 'nullable|string|max:30',
            'message'   => 'nullable|string|max:1000',
        ]);

        $data['property_id'] = $propertyId;
        $data['user_id']     = $request->user() ? $request->user()->id : null;

        $booking = BookingRequest::create($data);

        return response()->json($booking->load('property:id,title,address,price'), 201);
    }

    // Owner sees bookings for their properties
    public function ownerIndex(Request $request)
    {
        $bookings = BookingRequest::with(['property:id,title,address', 'user:id,name,email'])
            ->whereHas('property', fn ($q) => $q->where('user_id', $request->user()->id))
            ->latest()
            ->paginate(20);

        return response()->json($bookings);
    }

    // Authenticated user sees their own booking requests
    public function myBookings(Request $request)
    {
        $bookings = BookingRequest::with(['property:id,title,address,price,cover_image'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json($bookings);
    }

    // Owner accepts/rejects a booking
    public function updateStatus(Request $request, $id)
    {
        $booking = BookingRequest::with('property')->findOrFail($id);

        if ($booking->property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'status' => 'required|in:accepted,rejected,cancelled',
        ]);

        $booking->update($data);

        return response()->json($booking);
    }

    public function show($id)
    {
        return response()->json(
            BookingRequest::with(['property:id,title,address,price,cover_image', 'user:id,name,email'])
                ->findOrFail($id)
        );
    }
}

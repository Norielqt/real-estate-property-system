<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'description', 'type', 'listing_type',
        'price', 'address', 'city', 'state', 'country', 'zip_code',
        'latitude', 'longitude', 'bedrooms', 'bathrooms', 'area_sqft',
        'parking_spots', 'is_furnished', 'is_featured', 'status',
        'cover_image', 'amenities',
    ];

    protected $casts = [
        'amenities'    => 'array',
        'is_furnished' => 'boolean',
        'is_featured'  => 'boolean',
        'latitude'     => 'float',
        'longitude'    => 'float',
        'price'        => 'float',
        'area_sqft'    => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class)->orderBy('order');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function bookings()
    {
        return $this->hasMany(BookingRequest::class);
    }

    public function isFavoritedBy($userId)
    {
        return $this->favorites()->where('user_id', $userId)->exists();
    }
}

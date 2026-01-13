<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Immobile extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'code',
        'title',
        'slug',
        'description',
        'type_image',
        'picture',
        'price',
        'currency_id',
        'category_id',
        'neighborhood_id',
        'owner_id',
        'address',
        'area',
        'room',
        'bathroom',
        'car',
        'pool',
        'cave',
        'wifi',
        'park',
        'kitchen',
        'pantry',
        'electric_oven',
        'gym',
        'laundry',
        'balcony',
        'service_area',
        'cctv',
        'equipped_kitchen',
        'suit',
        'acclimatized',
        'generator',
        'guard',
        'twenty_four_hour_security',
        'reception_area',
        'living_room',
        'terrace',
        'elevator',
        'built_in_stove',
        'desk',
        'courtyard',
        'attachments',
        'garden',
        'furnished',
        'latitude',
        'longitude',
        'views',
        'finality_id',
        'responsible_id',
        'emphasis',
        'status',
        'created_at',
        'updated_at'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function neighborhood(): belongsTo
    {
        return $this->belongsTo(Neighborhood::class, 'neighborhood_id', 'id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id', 'id');
    }

    public function finality(): BelongsTo
    {
        return $this->belongsTo(Finality::class, 'finality_id', 'id');
    }

    public function responsible(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'responsible_id', 'id');
    }

    public function comment(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function favorite(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function immobile_gallery(): HasMany
    {
        return $this->hasMany(ImmobileGallery::class);
    }
}

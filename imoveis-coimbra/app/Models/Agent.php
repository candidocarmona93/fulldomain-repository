<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agent extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'picture',
        'slug',
        'address',
        'email',
        'contact_1',
        'contact_2',
        'postal_code',
        'establishment_id',
        'created_at',
        'updated_at',
    ];

    public function immobile(): HasMany
    {
        return $this->hasMany(Immobile::class);
    }
}

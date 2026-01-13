<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Finality extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'status',
        'created_at',
        'updated_at',
    ];

    public function immobile(): HasMany
    {
        return $this->hasMany(Immobile::class);
    }
}

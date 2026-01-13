<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'symbol',
        'name',
        'symbol_native',
        'decimal_digits',
        'rounding',
        'code',
        'name_plural'
    ];

    public function immobile(): HasMany
    {
        return $this->hasMany(Immobile::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'immobile_id',
        'classification',
        'summary',
        'analysis',
        'nickname',
        'name',
        'status',
        'created_at',
        'updated_at',
    ];

    public function immobile(): BelongsTo
    {
        return $this->belongsTo(Immobile::class, 'immobile_id', 'id');
    }
}

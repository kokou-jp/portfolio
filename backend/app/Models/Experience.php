<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Experience extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'company',
        'position',
        'description',
        'start_date',
        'end_date',
        'location',
        'technologies',
        'link',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}

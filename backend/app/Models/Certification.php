<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Certification extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'organization',
        'issue_date',
        'credential_id',
        'credential_url',
        'image_url',
    ];

    protected $casts = [
        'issue_date' => 'date',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Media extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'media';

    protected $fillable = [
        'filename',
        'path',
        'url',
        'mime_type',
        'file_size',
        'type', // image, pdf, document, other
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CvFile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'version',
        'file_path',
        'url',
        'is_active',
        'download_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'download_count' => 'integer',
    ];

    protected $appends = ['status'];

    public function getStatusAttribute(): string
    {
        return $this->is_active ? 'published' : 'draft';
    }
}

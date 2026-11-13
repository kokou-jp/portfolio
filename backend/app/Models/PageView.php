<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PageView extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'page_path',
        'ip_address',
        'user_agent',
        'referer',
        'trackable_id',
        'trackable_type',
    ];

    public function trackable(): MorphTo
    {
        return $this->morphTo();
    }
}

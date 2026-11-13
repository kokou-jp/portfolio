<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Media;

class MediaPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->role === 'ADMIN' ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }

    public function view(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }

    public function update(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }

    public function delete(User $user): bool
    {
        return $user->role === 'ADMIN';
    }
}

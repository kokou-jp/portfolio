<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Experience;

class ExperiencePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->role === 'ADMIN' ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->role === 'ADMIN';
    }

    public function view(User $user): bool
    {
        return $user->role === 'ADMIN';
    }

    public function create(User $user): bool
    {
        return $user->role === 'ADMIN';
    }

    public function update(User $user): bool
    {
        return $user->role === 'ADMIN';
    }

    public function delete(User $user): bool
    {
        return $user->role === 'ADMIN';
    }
}

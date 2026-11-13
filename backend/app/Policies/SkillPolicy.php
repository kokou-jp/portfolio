<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Skill;

class SkillPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'ADMIN') {
            return true;
        }

        if ($user->role === 'EDITOR' && in_array($ability, ['viewAny', 'view', 'create', 'update'])) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->role === 'EDITOR';
    }

    public function view(User $user): bool
    {
        return $user->role === 'EDITOR';
    }

    public function create(User $user): bool
    {
        return $user->role === 'EDITOR';
    }

    public function update(User $user): bool
    {
        return $user->role === 'EDITOR';
    }

    public function delete(User $user): bool
    {
        return $user->role === 'EDITOR';
    }
}

<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Project;
use App\Models\Post;
use App\Models\Skill;
use App\Models\Experience;
use App\Models\Education;
use App\Models\Certification;
use App\Models\Message;
use App\Models\Media;
use App\Models\CvFile;
use App\Models\Setting;
use App\Models\Profile;

class AdminPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'ADMIN') {
            return true;
        }

        return null;
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
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }

    public function manageSettings(User $user): bool
    {
        return $user->role === 'ADMIN';
    }

    public function manageMedia(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }

    public function manageCv(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }

    public function manageMessages(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }

    public function manageTimeline(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }

    public function manageProfile(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'EDITOR']);
    }
}

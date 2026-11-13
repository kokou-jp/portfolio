<?php

namespace App\Providers;

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
use App\Policies\ProjectPolicy;
use App\Policies\PostPolicy;
use App\Policies\SkillPolicy;
use App\Policies\ExperiencePolicy;
use App\Policies\EducationPolicy;
use App\Policies\CertificationPolicy;
use App\Policies\MessagePolicy;
use App\Policies\MediaPolicy;
use App\Policies\CvFilePolicy;
use App\Policies\SettingPolicy;
use App\Policies\ProfilePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Project::class => ProjectPolicy::class,
        Post::class => PostPolicy::class,
        Skill::class => SkillPolicy::class,
        Experience::class => ExperiencePolicy::class,
        Education::class => EducationPolicy::class,
        Certification::class => CertificationPolicy::class,
        Message::class => MessagePolicy::class,
        Media::class => MediaPolicy::class,
        CvFile::class => CvFilePolicy::class,
        Setting::class => SettingPolicy::class,
        Profile::class => ProfilePolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}

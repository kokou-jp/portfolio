<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Profiles Table
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('bio')->nullable();
            $table->string('location')->nullable();
            $table->string('availability_status')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar_url')->nullable();
            $table->text('long_bio')->nullable();
            $table->timestamps();
        });

        // 2. Social Links Table
        Schema::create('social_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id');
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->string('platform');
            $table->string('url');
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Categories Table (for Projects)
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // 4. Projects Table
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('short_description');
            $table->text('full_description')->nullable();
            $table->string('main_image_url')->nullable();
            $table->uuid('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->string('status')->default('draft'); // draft, published
            $table->boolean('is_featured')->default(false);
            $table->string('github_url')->nullable();
            $table->string('demo_url')->nullable();
            $table->date('project_date')->nullable();
            $table->timestamps();
        });

        // 5. Project Images Table (Gallery)
        Schema::create('project_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->string('url');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 6. Skills Table
        Schema::create('skills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('category'); // Frontend, Backend, Database, DevOps, Tools, Other
            $table->integer('level')->default(50); // 1 to 100
            $table->integer('years_of_experience')->nullable();
            $table->integer('sort_order')->default(0);
            $table->string('icon_name')->nullable();
            $table->timestamps();
        });

        // 7. Project Skill Table (Pivot)
        Schema::create('project_skill', function (Blueprint $table) {
            $table->id();
            $table->uuid('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->uuid('skill_id');
            $table->foreign('skill_id')->references('id')->on('skills')->onDelete('cascade');
            $table->timestamps();
        });

        // 8. Experiences Table
        Schema::create('experiences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('company');
            $table->string('position');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable(); // null means current
            $table->string('location')->nullable();
            $table->text('technologies')->nullable(); // Comma-separated or JSON
            $table->string('link')->nullable();
            $table->timestamps();
        });

        // 9. Educations Table
        Schema::create('educations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('institution');
            $table->string('degree');
            $table->string('field_of_study')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('completed'); // completed, ongoing
            $table->timestamps();
        });

        // 10. Certifications Table
        Schema::create('certifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('organization');
            $table->date('issue_date');
            $table->string('credential_id')->nullable();
            $table->string('credential_url')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();
        });

        // 11. Post Categories Table (for Blog)
        Schema::create('post_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // 12. Posts Table (Blog)
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('content'); // Markdown / Rich Text
            $table->string('cover_image_url')->nullable();
            $table->uuid('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('post_categories')->onDelete('set null');
            $table->string('status')->default('draft'); // draft, published
            $table->integer('reading_time')->default(1); // in minutes
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // 13. Tags Table
        Schema::create('tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // 14. Post Tag Table (Pivot)
        Schema::create('post_tag', function (Blueprint $table) {
            $table->id();
            $table->uuid('post_id');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->uuid('tag_id');
            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade');
            $table->timestamps();
        });

        // 15. Messages Table
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email');
            $table->string('subject');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // 16. Media Table (Library)
        Schema::create('media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('filename');
            $table->string('path');
            $table->string('url');
            $table->string('mime_type');
            $table->integer('file_size');
            $table->string('type'); // image, pdf, document, other
            $table->timestamps();
        });

        // 17. CV Files Table
        Schema::create('cv_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('version')->nullable();
            $table->string('file_path');
            $table->string('url');
            $table->boolean('is_active')->default(false);
            $table->integer('download_count')->default(0);
            $table->timestamps();
        });

        // 18. Page Views Table (Tracking)
        Schema::create('page_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('page_path');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('referer')->nullable();
            $table->uuid('trackable_id')->nullable();
            $table->string('trackable_type')->nullable(); // Post, Project, CV
            $table->timestamps();
        });

        // 19. Settings Table
        Schema::create('settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('page_views');
        Schema::dropIfExists('cv_files');
        Schema::dropIfExists('media');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('post_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('post_categories');
        Schema::dropIfExists('certifications');
        Schema::dropIfExists('educations');
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('project_skill');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('project_images');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('social_links');
        Schema::dropIfExists('profiles');
    }
};

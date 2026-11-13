<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PageViewController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TimelineController;
use App\Http\Controllers\CvController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Page View Tracking
Route::post('/page-views', [PageViewController::class, 'store']);

// Sitemap & Robots
Route::get('/sitemap.xml', [SitemapController::class, 'sitemap']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);

// Auth
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Profile & Social Links
Route::get('/profile', [ProfileController::class, 'show']);
Route::get('/social-links', [ProfileController::class, 'socialLinks']);

// Projects
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{slug}', [ProjectController::class, 'show']);
Route::get('/categories', [ProjectController::class, 'categories']);

// Skills, Experiences, Educations, Certifications
Route::get('/skills', [TimelineController::class, 'skills']);
Route::get('/experiences', [TimelineController::class, 'experiences']);
Route::get('/educations', [TimelineController::class, 'educations']);
Route::get('/educations/{id}', [TimelineController::class, 'showEducation']);
Route::get('/certifications', [TimelineController::class, 'certifications']);
Route::get('/certifications/{id}', [TimelineController::class, 'showCertification']);

// Blog
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']);
Route::get('/post-categories', [PostController::class, 'categories']);

// Media
Route::get('/media', [MediaController::class, 'publicIndex']);
Route::get('/media/{id}', [MediaController::class, 'publicShow']);

// Contact
Route::post('/contact', [ContactController::class, 'store']);

// CV
Route::get('/cv', [CvController::class, 'show']);
Route::get('/cv/download', [CvController::class, 'download']);

// Public Stats
Route::get('/settings/stats', [SettingController::class, 'publicStats']);

// ============================================
// PROTECTED AUTH ROUTES
// ============================================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // ==========================================
    // ADMIN ROUTES
    // ==========================================
    Route::prefix('admin')->middleware('role:ADMIN,EDITOR')->group(function () {

        // Dashboard Stats
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/visits', [DashboardController::class, 'visits']);
        Route::get('/dashboard/popular-projects', [DashboardController::class, 'popularProjects']);
        Route::get('/dashboard/popular-posts', [DashboardController::class, 'popularPosts']);

        // Profile
        Route::get('/profile', [ProfileController::class, 'adminShow']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::get('/profile/social-links', [ProfileController::class, 'socialLinks']);
        Route::put('/profile/social-links', [ProfileController::class, 'updateSocialLinks']);

        // Projects CRUD
        Route::get('/projects', [ProjectController::class, 'adminIndex']);
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::get('/projects/{id}/edit', [ProjectController::class, 'edit']);
        Route::put('/projects/{id}', [ProjectController::class, 'update']);
        Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

        // Skills CRUD
        Route::get('/skills/{id}', [TimelineController::class, 'showSkill']);
        Route::post('/skills', [TimelineController::class, 'storeSkill']);
        Route::put('/skills/{id}', [TimelineController::class, 'updateSkill']);
        Route::delete('/skills/{id}', [TimelineController::class, 'destroySkill']);

        // Experiences CRUD
        Route::get('/experiences/{id}', [TimelineController::class, 'showExperience']);
        Route::post('/experiences', [TimelineController::class, 'storeExperience']);
        Route::put('/experiences/{id}', [TimelineController::class, 'updateExperience']);
        Route::delete('/experiences/{id}', [TimelineController::class, 'destroyExperience']);

        // Educations CRUD
        Route::get('/educations/{id}', [TimelineController::class, 'showEducation']);
        Route::post('/educations', [TimelineController::class, 'storeEducation']);
        Route::put('/educations/{id}', [TimelineController::class, 'updateEducation']);
        Route::delete('/educations/{id}', [TimelineController::class, 'destroyEducation']);

        // Certifications CRUD
        Route::get('/certifications/{id}', [TimelineController::class, 'showCertification']);
        Route::post('/certifications', [TimelineController::class, 'storeCertification']);
        Route::put('/certifications/{id}', [TimelineController::class, 'updateCertification']);
        Route::delete('/certifications/{id}', [TimelineController::class, 'destroyCertification']);

        // Posts CRUD
        Route::get('/posts', [PostController::class, 'adminIndex']);
        Route::post('/posts', [PostController::class, 'store']);
        Route::get('/posts/{id}/edit', [PostController::class, 'edit']);
        Route::put('/posts/{id}', [PostController::class, 'update']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);

        // Messages
        Route::get('/messages', [ContactController::class, 'index']);
        Route::get('/messages/unread-count', [ContactController::class, 'unreadCount']);
        Route::put('/messages/{id}/read', [ContactController::class, 'toggleRead']);
        Route::get('/messages/{id}', [ContactController::class, 'show']);
        Route::delete('/messages/{id}', [ContactController::class, 'destroy']);

        // Media
        Route::get('/media', [MediaController::class, 'index']);
        Route::post('/media', [MediaController::class, 'store']);
        Route::delete('/media/{id}', [MediaController::class, 'destroy']);

        // CV Management
        Route::get('/cv', [CvController::class, 'adminIndex']);
        Route::post('/cv/upload', [CvController::class, 'upload']);
        Route::put('/cv/{id}', [CvController::class, 'update']);
        Route::delete('/cv/{id}', [CvController::class, 'destroy']);
        Route::post('/cv/{id}/activate', [CvController::class, 'activate']);

        // Settings (ADMIN only)
        Route::middleware('role:ADMIN')->group(function () {
            Route::get('/settings', [SettingController::class, 'index']);
            Route::put('/settings', [SettingController::class, 'update']);
        });
    });
});


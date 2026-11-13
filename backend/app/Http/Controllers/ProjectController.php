<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Category;
use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects (Public).
     */
    public function index(Request $request)
    {
        $query = Project::with(['category', 'skills'])
            ->where('status', 'published');

        // Search title/description
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Filter by category slug
        if ($request->has('category')) {
            $catSlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($catSlug) {
                $q->where('slug', $catSlug);
            });
        }

        // Filter by skill ID
        if ($request->has('skill')) {
            $skillId = $request->input('skill');
            $query->whereHas('skills', function ($q) use ($skillId) {
                $q->where('skills.id', $skillId);
            });
        }

        // Sort by featured first, then date
        $projects = $query->orderBy('is_featured', 'desc')
            ->orderBy('project_date', 'desc')
            ->paginate($request->input('per_page', 9));

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

    /**
     * Display projects listing (Admin - includes drafts).
     */
    public function adminIndex(Request $request)
    {
        $query = Project::with(['category', 'skills']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        $projects = $query->orderBy('project_date', 'desc')
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

    /**
     * Store a newly created project (Admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'short_description' => 'required|string',
            'full_description' => 'nullable|string',
            'main_image_url' => 'nullable|url',
            'category_id' => 'nullable|exists:categories,id',
            'status' => 'required|in:draft,published',
            'is_featured' => 'boolean',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'project_date' => 'nullable|date',
            'skills' => 'nullable|array',
            'skills.*' => 'exists:skills,id',
            'gallery' => 'nullable|array',
            'gallery.*' => 'url',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);

        $skills = $validated['skills'] ?? [];
        $gallery = $validated['gallery'] ?? [];
        unset($validated['skills'], $validated['gallery']);

        $project = Project::create($validated);

        // Sync skills
        if (!empty($skills)) {
            $project->skills()->sync($skills);
        }

        // Save gallery images
        foreach ($gallery as $index => $url) {
            $project->images()->create([
                'url' => $url,
                'sort_order' => $index
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Projet créé avec succès.',
            'data' => $project->load(['category', 'skills', 'images'])
        ], 201);
    }

    /**
     * Display the specified project by slug (Public).
     */
    public function show(string $slug, Request $request)
    {
        $project = Project::with(['category', 'skills', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Increment page view count asynchronously/log
        PageView::create([
            'page_path' => "/projects/{$slug}",
            'ip_address' => sha1($request->ip()),
            'user_agent' => $request->userAgent(),
            'referer' => $request->header('referer'),
            'trackable_id' => $project->id,
            'trackable_type' => Project::class
        ]);

        return response()->json([
            'success' => true,
            'data' => $project
        ]);
    }

    /**
     * Get project details for editing (Admin).
     */
    public function edit(string $id)
    {
        $project = Project::with(['category', 'skills', 'images'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $project
        ]);
    }

    /**
     * Update the specified project (Admin).
     */
    public function update(Request $request, string $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'short_description' => 'required|string',
            'full_description' => 'nullable|string',
            'main_image_url' => 'nullable|url',
            'category_id' => 'nullable|exists:categories,id',
            'status' => 'required|in:draft,published',
            'is_featured' => 'boolean',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'project_date' => 'nullable|date',
            'skills' => 'nullable|array',
            'skills.*' => 'exists:skills,id',
            'gallery' => 'nullable|array',
            'gallery.*' => 'url',
        ]);

        if ($project->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        }

        $skills = $validated['skills'] ?? [];
        $gallery = $validated['gallery'] ?? [];
        unset($validated['skills'], $validated['gallery']);

        $project->update($validated);

        // Sync skills
        if (!empty($skills)) {
            $project->skills()->sync($skills);
        }

        // Recreate gallery
        if (!empty($gallery)) {
            $project->images()->delete();
            foreach ($gallery as $index => $url) {
                $project->images()->create([
                    'url' => $url,
                    'sort_order' => $index
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Projet mis à jour avec succès.',
            'data' => $project->load(['category', 'skills', 'images'])
        ]);
    }

    /**
     * Remove the specified project (Admin).
     */
    public function destroy(string $id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Projet supprimé avec succès.'
        ]);
    }

    /**
     * Get categories list for filtering (Public).
     */
    public function categories()
    {
        $categories = Category::withCount('projects')->get();
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}



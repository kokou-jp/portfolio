<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Tag;
use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * Display a listing of blog posts (Public).
     */
    public function index(Request $request)
    {
        $query = Post::with(['category', 'tags'])
            ->where('status', 'published');

        // Search title/content
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        // Filter by category slug
        if ($request->has('category')) {
            $catSlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($catSlug) {
                $q->where('slug', $catSlug);
            });
        }

        // Filter by tag slug
        if ($request->has('tag')) {
            $tagSlug = $request->input('tag');
            $query->whereHas('tags', function ($q) use ($tagSlug) {
                $q->where('slug', $tagSlug);
            });
        }

        $posts = $query->orderBy('published_at', 'desc')
            ->paginate($request->input('per_page', 6));

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * Display posts list (Admin - includes drafts).
     */
    public function adminIndex(Request $request)
    {
        $query = Post::with(['category', 'tags']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        $posts = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * Store a newly created post (Admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'required|string',
            'cover_image_url' => 'nullable|url',
            'category_id' => 'nullable|exists:post_categories,id',
            'status' => 'required|in:draft,published',
            'reading_time' => 'integer|min:1',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        
        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        $post = Post::create($validated);

        // Sync tags (create tags if they don't exist)
        if (isset($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $name = trim((string) $tagName);
                if ($name === '') {
                    continue;
                }
                $slug = Str::slug($name);
                $tag = Tag::firstOrCreate(['slug' => $slug], ['name' => $name]);
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Article créé avec succès.',
            'data' => $post->load(['category', 'tags'])
        ], 201);
    }

    /**
     * Display the specified post by slug (Public).
     */
    public function show(string $slug, Request $request)
    {
        $post = Post::with(['category', 'tags'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        // Track page view
        PageView::create([
            'page_path' => "/articles/{$slug}",
            'ip_address' => sha1($request->ip()),
            'user_agent' => $request->userAgent(),
            'referer' => $request->header('referer'),
            'trackable_id' => $post->id,
            'trackable_type' => Post::class
        ]);

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    /**
     * Get post details for editing (Admin).
     */
    public function edit(string $id)
    {
        $post = Post::with(['category', 'tags'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    /**
     * Update the specified post (Admin).
     */
    public function update(Request $request, string $id)
    {
        $post = Post::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'required|string',
            'cover_image_url' => 'nullable|url',
            'category_id' => 'nullable|exists:post_categories,id',
            'status' => 'required|in:draft,published',
            'reading_time' => 'integer|min:1',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
        ]);

        if ($post->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        }

        if ($validated['status'] === 'published' && !$post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        // Sync tags
        if (isset($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $name = trim((string) $tagName);
                if ($name === '') {
                    continue;
                }
                $slug = Str::slug($name);
                $tag = Tag::firstOrCreate(['slug' => $slug], ['name' => $name]);
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Article mis à jour avec succès.',
            'data' => $post->load(['category', 'tags'])
        ]);
    }

    /**
     * Remove the specified post (Admin).
     */
    public function destroy(string $id)
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Article supprimé avec succès.'
        ]);
    }

    /**
     * Get categories list for blog (Public).
     */
    public function categories()
    {
        $categories = PostCategory::withCount('posts')->get();
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}




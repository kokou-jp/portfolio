<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\SocialLink;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get the public profile with social links.
     */
    public function show()
    {
        $profile = Profile::with('socialLinks')->first();
        
        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profil non configuré.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $profile
        ]);
    }

    /**
     * Get profile for admin editing (Admin).
     */
    public function adminShow()
    {
        $profile = Profile::with('socialLinks')->first();

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profil non configuré.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $profile
        ]);
    }

    /**
     * Update profile details (Admin).
     */
    public function update(Request $request)
    {
        $profile = Profile::first();

        if (!$profile) {
            $profile = new Profile();
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'bio' => 'required|string',
            'location' => 'nullable|string|max:255',
            'availability_status' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'avatar_url' => 'nullable|url',
            'long_bio' => 'nullable|string',
        ]);

        // If user is authenticated, associate user_id
        if (auth()->check()) {
            $profile->user_id = auth()->id();
        }

        $profile->fill($validated);
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès.',
            'data' => $profile
        ]);
    }

    /**
     * Get active social links.
     */
    public function socialLinks()
    {
        $links = SocialLink::where('is_active', true)->orderBy('sort_order')->get();
        return response()->json([
            'success' => true,
            'data' => $links
        ]);
    }

    /**
     * Update social links (Admin).
     */
    public function updateSocialLinks(Request $request)
    {
        $request->validate([
            'links' => 'required|array',
            'links.*.platform' => 'required|string',
            'links.*.url' => 'required|url',
            'links.*.icon' => 'nullable|string',
            'links.*.sort_order' => 'integer',
            'links.*.is_active' => 'boolean',
        ]);

        $profile = Profile::first();
        if (!$profile) {
            return response()->json(['success' => false, 'message' => 'Veuillez créer un profil d\'abord.'], 400);
        }

        // Delete existing links
        $profile->socialLinks()->delete();

        // Create new links
        foreach ($request->links as $linkData) {
            $profile->socialLinks()->create($linkData);
        }

        return response()->json([
            'success' => true,
            'message' => 'Réseaux sociaux mis à jour avec succès.',
            'data' => $profile->load('socialLinks')
        ]);
    }
}



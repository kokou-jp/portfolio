<?php

namespace App\Http\Controllers;

use App\Models\PageView;
use Illuminate\Http\Request;

class PageViewController extends Controller
{
    /**
     * Record a page view (Public).
     */
    public function store(Request $request)
    {
        $request->validate([
            'page_path' => 'required|string|max:255',
            'referer' => 'nullable|string|max:500',
        ]);

        try {
            PageView::create([
                'page_path' => $request->input('page_path'),
                'ip_address' => sha1($request->ip()),
                'user_agent' => $request->userAgent(),
                'referer' => $request->input('referer') ?? $request->header('referer'),
            ]);
        } catch (\Exception $e) {
            // Silently ignore - tracking should never break the user experience
        }

        return response()->json([
            'success' => true,
        ]);
    }
}


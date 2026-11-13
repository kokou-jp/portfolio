<?php

namespace App\Http\Controllers;

use App\Models\CvFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CvController extends Controller
{
    /**
     * Get the active CV (Public).
     */
    public function show()
    {
        $cv = CvFile::where('is_active', true)->first();

        return response()->json([
            'success' => true,
            'data' => $cv
        ]);
    }

    /**
     * Download the active CV and increment download count (Public).
     */
    public function download()
    {
        $cv = CvFile::where('is_active', true)->firstOrFail();

        $cv->increment('download_count');

        return response()->json([
            'success' => true,
            'message' => 'T�l�chargement enregistr�.',
            'data' => [
                'url' => $cv->url,
                'download_count' => $cv->download_count
            ]
        ]);
    }

    /**
     * List all CV files (Admin).
     */
    public function adminIndex()
    {
        $cvs = CvFile::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $cvs
        ]);
    }

    /**
     * Upload a new CV file (Admin).
     */
    public function upload(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf|max:10240',
            'version' => 'nullable|string|max:255',
            'status' => 'nullable|in:draft,published',
        ]);

        try {
            $file = $request->file('file');
            $path = $file->store('cv', 'public');
            $url = asset('storage/' . $path);

            $isFirst = CvFile::count() === 0;
            $status = $validated['status'] ?? ($isFirst ? 'published' : 'draft');
            $isActive = $status === 'published';

            if ($isActive) {
                CvFile::where('is_active', true)->update(['is_active' => false]);
            }

            $cv = CvFile::create([
                'version' => $validated['version'] ?? date('Y-m-d'),
                'file_path' => $path,
                'url' => $url,
                'is_active' => $isActive,
                'download_count' => 0,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'CV téléchargé avec succès.',
                'data' => $cv
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement du CV.',
                'errors' => ['file' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Update CV details (Admin).
     */
    public function update(Request $request, string $id)
    {
        $cv = CvFile::findOrFail($id);

        $validated = $request->validate([
            'version' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'status' => 'nullable|in:draft,published',
        ]);

        if (array_key_exists('status', $validated)) {
            $validated['is_active'] = $validated['status'] === 'published';
        }

        if (!empty($validated['is_active'])) {
            CvFile::where('id', '!=', $id)->update(['is_active' => false]);
        }

        unset($validated['status']);
        $cv->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'CV mis à jour avec succès.',
            'data' => $cv->fresh()
        ]);
    }

    /**
     * Activate a CV file (Admin).
     */
    public function activate(string $id)
    {
        $cv = CvFile::findOrFail($id);

        // Deactivate all other CVs first
        CvFile::where('id', '!=', $id)->update(['is_active' => false]);
        $cv->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'CV activé avec succès.',
            'data' => $cv
        ]);
    }

    /**
     * Delete a CV file (Admin).
     */
    public function destroy(string $id)
    {
        $cv = CvFile::findOrFail($id);

        // Delete the file from storage
        if (Storage::exists('public/' . $cv->file_path)) {
            Storage::delete('public/' . $cv->file_path);
        }

        $cv->delete();

        return response()->json([
            'success' => true,
            'message' => 'CV supprimé avec succès.'
        ]);
    }
}


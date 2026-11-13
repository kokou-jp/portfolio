<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\CvFile;
use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MediaController extends Controller
{
    /**
     * List media library files (Public).
     */
    public function publicIndex(Request $request)
    {
        $query = Media::query();

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        $media = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 18));

        return response()->json([
            'success' => true,
            'data' => $media
        ]);
    }

    /**
     * Get a single media file (Public).
     */
    public function publicShow(string $id)
    {
        $media = Media::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $media
        ]);
    }

    /**
     * List media library files (Admin).
     */
    public function index(Request $request)
    {
        $query = Media::query();

        if ($request->has('type')) {
            $query->where('type', $request->input('type')); // image, pdf, document, other
        }

        if ($request->has('search')) {
            $query->where('filename', 'like', "%{$request->input('search')}%");
        }

        $media = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 18));

        return response()->json([
            'success' => true,
            'data' => $media
        ]);
    }

    /**
     * Upload a general media file (Admin).
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB
            'type' => 'nullable|string|in:image,pdf,document,other'
        ]);

        if (!$request->file('file')->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier de téléchargement invalide.'
            ], 400);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mime = $file->getClientMimeType();
        $size = $file->getSize();

        // Determine type if not specified
        $type = $request->input('type');
        if (!$type) {
            if (strpos($mime, 'image/') !== false) {
                $type = 'image';
            } elseif ($mime === 'application/pdf') {
                $type = 'pdf';
            } elseif (in_array($mime, ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
                $type = 'document';
            } else {
                $type = 'other';
            }
        }

        // Store file in public storage folder
        $path = $file->store('media', 'public');
        $url = Storage::disk('public')->url($path);

        $media = Media::create([
            'filename' => $originalName,
            'path' => $path,
            'url' => $url,
            'mime_type' => $mime,
            'file_size' => $size,
            'type' => $type
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fichier téléchargé avec succès.',
            'data' => $media
        ], 201);
    }

    /**
     * Delete a media file (Admin).
     */
    public function destroy(string $id)
    {
        $media = Media::findOrFail($id);

        // Delete from local disk
        if (Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fichier supprimé avec succès.'
        ]);
    }

    // ==========================================
    // CV FILE ENDPOINTS
    // ==========================================

    /**
     * Get active CV file info (Public).
     */
    public function getCv()
    {
        $cv = CvFile::where('is_active', true)->first();

        if (!$cv) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun CV actif disponible.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $cv
        ]);
    }

    /**
     * Upload curriculum vitae (Admin).
     */
    public function uploadCv(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:5120', // Max 5MB PDF
            'version' => 'nullable|string'
        ]);

        $file = $request->file('file');
        $path = $file->store('cv', 'public');
        $url = Storage::disk('public')->url($path);

        // Deactivate older CVs
        CvFile::where('is_active', true)->update(['is_active' => false]);

        $cv = CvFile::create([
            'version' => $request->input('version', 'v' . date('Ymd')),
            'file_path' => $path,
            'url' => $url,
            'is_active' => true,
            'download_count' => 0
        ]);

        return response()->json([
            'success' => true,
            'message' => 'CV mis en ligne avec succès.',
            'data' => $cv
        ], 201);
    }

    /**
     * Download CV file & increment counter (Public).
     */
    public function downloadCv(Request $request)
    {
        $cv = CvFile::where('is_active', true)->first();

        if (!$cv) {
            return response()->json(['success' => false, 'message' => 'CV indisponible.'], 404);
        }

        // Increment count
        $cv->increment('download_count');

        // Track page view / download action
        PageView::create([
            'page_path' => '/cv/download',
            'ip_address' => sha1($request->ip()),
            'user_agent' => $request->userAgent(),
            'referer' => $request->header('referer'),
            'trackable_id' => $cv->id,
            'trackable_type' => CvFile::class
        ]);

        return response()->json([
            'success' => true,
            'url' => $cv->url,
            'downloads' => $cv->download_count
        ]);
    }
}



<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
      * Get public stats for hero section (Public).
      */
    public function publicStats()
    {
        $settings = Setting::whereIn('key', [
            'personal_projects_count',
            'years_experience_count',
            'project_views_count',
            'cv_downloads_count',
        ])->pluck('value', 'key')->toArray();

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
      * Get all settings as key-value map (Admin).
      */
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Update settings (Admin).
     */
    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable|string',
        ]);

        foreach ($request->settings as $key => $value) {
            if ($value === null) continue;
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Paramètres mis à jour avec succès.',
            'data' => Setting::all()->pluck('value', 'key')
        ]);
    }
}


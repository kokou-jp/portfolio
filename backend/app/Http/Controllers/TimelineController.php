<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\Experience;
use App\Models\Education;
use App\Models\Certification;
use Illuminate\Http\Request;

class TimelineController extends Controller
{
    public function skills()
    {
        $skills = Skill::orderBy('category')->orderBy('sort_order')->get();
        return response()->json(['success' => true, 'data' => $skills]);
    }

    public function showSkill(string $id)
    {
        $skill = Skill::findOrFail($id);
        return response()->json(['success' => true, 'data' => $skill]);
    }

    public function storeSkill(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:Frontend,Backend,Database,DevOps,Tools,Other',
            'level' => 'required|integer|min:1|max:100',
            'years_of_experience' => 'nullable|integer',
            'sort_order' => 'integer',
            'icon_name' => 'nullable|string',
        ]);

        $skill = Skill::create($validated);
        return response()->json(['success' => true, 'message' => 'Compétence ajoutée.', 'data' => $skill], 201);
    }

    public function updateSkill(Request $request, string $id)
    {
        $skill = Skill::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:Frontend,Backend,Database,DevOps,Tools,Other',
            'level' => 'required|integer|min:1|max:100',
            'years_of_experience' => 'nullable|integer',
            'sort_order' => 'integer',
            'icon_name' => 'nullable|string',
        ]);

        $skill->update($validated);
        return response()->json(['success' => true, 'message' => 'Compétence mise à jour.', 'data' => $skill]);
    }

    public function destroySkill(string $id)
    {
        Skill::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Compétence supprimée.']);
    }

    public function experiences()
    {
        $experiences = Experience::orderBy('start_date', 'desc')->get();
        return response()->json(['success' => true, 'data' => $experiences]);
    }

    public function showExperience(string $id)
    {
        $experience = Experience::findOrFail($id);
        return response()->json(['success' => true, 'data' => $experience]);
    }

    public function storeExperience(Request $request)
    {
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string',
            'technologies' => 'nullable|string',
            'link' => 'nullable|url',
        ]);

        $experience = Experience::create($validated);
        return response()->json(['success' => true, 'message' => 'Expérience ajoutée.', 'data' => $experience], 201);
    }

    public function updateExperience(Request $request, string $id)
    {
        $experience = Experience::findOrFail($id);
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string',
            'technologies' => 'nullable|string',
            'link' => 'nullable|url',
        ]);

        $experience->update($validated);
        return response()->json(['success' => true, 'message' => 'Expérience mise à jour.', 'data' => $experience]);
    }

    public function destroyExperience(string $id)
    {
        Experience::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Expérience supprimée.']);
    }

    public function educations()
    {
        $educations = Education::orderBy('start_date', 'desc')->get();
        return response()->json(['success' => true, 'data' => $educations]);
    }

    public function showEducation(string $id)
    {
        $education = Education::findOrFail($id);
        return response()->json(['success' => true, 'data' => $education]);
    }

    public function storeEducation(Request $request)
    {
        $validated = $request->validate([
            'institution' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'status' => 'required|string|in:completed,ongoing',
        ]);

        $education = Education::create($validated);
        return response()->json(['success' => true, 'message' => 'Formation ajoutée.', 'data' => $education], 201);
    }

    public function updateEducation(Request $request, string $id)
    {
        $education = Education::findOrFail($id);
        $validated = $request->validate([
            'institution' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'status' => 'required|string|in:completed,ongoing',
        ]);

        $education->update($validated);
        return response()->json(['success' => true, 'message' => 'Formation mise à jour.', 'data' => $education]);
    }

    public function destroyEducation(string $id)
    {
        Education::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Formation supprimée.']);
    }

    public function certifications()
    {
        $certifications = Certification::orderBy('issue_date', 'desc')->get();
        return response()->json(['success' => true, 'data' => $certifications]);
    }

    public function showCertification(string $id)
    {
        $certification = Certification::findOrFail($id);
        return response()->json(['success' => true, 'data' => $certification]);
    }

    public function storeCertification(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'organization' => 'required|string|max:255',
            'issue_date' => 'required|date',
            'credential_id' => 'nullable|string',
            'credential_url' => 'nullable|url',
            'image_url' => 'nullable|url',
        ]);

        $certification = Certification::create($validated);
        return response()->json(['success' => true, 'message' => 'Certification ajoutée.', 'data' => $certification], 201);
    }

    public function updateCertification(Request $request, string $id)
    {
        $certification = Certification::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'organization' => 'required|string|max:255',
            'issue_date' => 'required|date',
            'credential_id' => 'nullable|string',
            'credential_url' => 'nullable|url',
            'image_url' => 'nullable|url',
        ]);

        $certification->update($validated);
        return response()->json(['success' => true, 'message' => 'Certification mise à jour.', 'data' => $certification]);
    }

    public function destroyCertification(string $id)
    {
        Certification::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Certification supprimée.']);
    }
}

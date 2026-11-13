<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate user and return a token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        // Rate limiting: max 5 attempts per minute
        $key = 'login:' . $request->ip();
        $attempts = cache()->get($key, 0);
        if ($attempts >= 5) {
            throw ValidationException::withMessages([
                'email' => ['Trop de tentatives. Veuillez réessayer dans 1 minute.'],
            ]);
        }
        cache()->put($key, $attempts + 1, 60);

        // Clean up old tokens first to avoid accumulation
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        // Reset attempts on success
        cache()->forget($key);

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ]
        ]);
    }

    /**
     * Revoke user token (logout).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie.'
        ]);
    }

    /**
     * Get authenticated user details.
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('profile.socialLinks');

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe mis à jour avec succès.'
        ]);
    }

    /**
     * Send password reset link (Public).
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => true,
                'message' => 'Si cette adresse email existe, un lien de réinitialisation a été envoyé.'
            ]);
        }

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return response()->json([
            'success' => true,
            'message' => 'Si cette adresse email existe, un lien de réinitialisation a été envoyé.'
        ]);
    }
}


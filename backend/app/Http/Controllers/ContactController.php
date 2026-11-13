<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Store contact message (Public).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10',
        ]);

        $message = Message::create($validated);

        // Try to send email to administrator, catch and log errors to avoid blocking visitor response
        try {
            $adminEmail = config('mail.from.address', 'admin@portfolio.com');
            
            Mail::raw(
                "Nouveau message de contact reçu de: {$message->name} ({$message->email})\n\n" .
                "Sujet: {$message->subject}\n\n" .
                "Message:\n{$message->message}",
                function ($mail) use ($message, $adminEmail) {
                    $mail->to($adminEmail)
                         ->subject("[Portfolio Contact] Nouveau message: {$message->subject}");
                }
            );
        } catch (\Exception $e) {
            Log::warning("Could not send contact email notification: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Votre message a bien été envoyé !',
            'data' => $message
        ], 201);
    }

    /**
     * List all messages (Admin).
     */
    public function index(Request $request)
    {
        $query = Message::query();

        if ($request->has('status')) {
            $status = $request->input('status'); // read, unread
            if ($status === 'read') {
                $query->where('is_read', true);
            } elseif ($status === 'unread') {
                $query->where('is_read', false);
            }
        }

        $messages = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10));

        // Get unread count to return alongside messages list
        $unreadCount = Message::where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
            'data' => $messages
        ]);
    }

    /**
     * Get unread messages count (Admin).
     */
    public function unreadCount()
    {
        $unreadCount = Message::where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $unreadCount
            ]
        ]);
    }

    /**
     * Mark message as read (Admin).
     */
    public function toggleRead(string $id)
    {
        $message = Message::findOrFail($id);
        if (!$message->is_read) {
            $message->update(['is_read' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message marqué comme lu.',
            'data' => $message
        ]);
    }

    /**
     * Get a single message (Admin).
     */
    public function show(string $id)
    {
        $message = Message::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $message
        ]);
    }

    /**
     * Remove the specified message (Admin).
     */
    public function destroy(string $id)
    {
        $message = Message::findOrFail($id);
        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message supprimé avec succès.'
        ]);
    }
}


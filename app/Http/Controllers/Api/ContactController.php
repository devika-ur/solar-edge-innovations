<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Mail\ContactInquiryMail;
use App\Models\ContactInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Handle incoming contact form submission.
     * Saves inquiry to database and dispatches email notification.
     */
    public function send(ContactRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            // 1. Store inquiry into database
            $inquiry = ContactInquiry::create([
                'name' => trim($validated['name']),
                'email' => trim($validated['email']),
                'phone' => trim($validated['phone']),
                'service' => trim($validated['service']),
                'place' => trim($validated['place']),
                'district' => trim($validated['district']),
                'message' => trim($validated['message']),
                'status' => 'pending',
                'ip_address' => $request->ip(),
                'user_agent' => substr((string)$request->userAgent(), 0, 500),
            ]);

            // 2. Attempt sending email notification
            try {
                $toEmail = config('mail.to_email', env('MAIL_TO_ADDRESS', 'devikaupendranr@gmail.com'));
                Mail::to($toEmail)->send(new ContactInquiryMail($validated));
            } catch (\Throwable $mailException) {
                // Log mail exception without failing the user submission
                Log::warning('Contact email delivery failed, but inquiry #' . $inquiry->id . ' was saved: ' . $mailException->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Thank you! Your message has been received. Our team will contact you shortly.',
                'inquiry_id' => $inquiry->id,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to save contact inquiry: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unable to submit your message right now. Please try again or contact us directly by phone.',
            ], 500);
        }
    }
}

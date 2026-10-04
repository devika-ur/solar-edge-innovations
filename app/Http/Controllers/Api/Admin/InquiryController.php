<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    /**
     * List all contact inquiries with filters and counts.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $statusFilter = $request->query('status', 'all');
            $search = trim((string)$request->query('search', ''));

            // Base query for active inquiries
            $baseQuery = ContactInquiry::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            });

            // Overall counts for filter tabs
            $totalCount = (clone $baseQuery)->count();
            $pendingCount = (clone $baseQuery)->where('status', 'pending')->count();
            $respondedCount = (clone $baseQuery)->where('status', 'responded')->count();

            // Apply status filter
            $query = clone $baseQuery;
            if ($statusFilter === 'pending') {
                $query->where('status', 'pending');
            } elseif ($statusFilter === 'responded') {
                $query->where('status', 'responded');
            }

            // Apply search filter
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('service', 'like', "%{$search}%")
                        ->orWhere('place', 'like', "%{$search}%")
                        ->orWhere('district', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            }

            $inquiries = $query->orderBy('id', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => (int)$item->id,
                        'name' => $item->name,
                        'email' => $item->email,
                        'phone' => $item->phone,
                        'service' => $item->service,
                        'place' => $item->place,
                        'district' => $item->district,
                        'message' => $item->message,
                        'status' => $item->status ?? 'pending',
                        'is_responded' => $item->status === 'responded',
                        'responded_at' => $item->responded_at?->toISOString() ?? null,
                        'responded_at_formatted' => $item->responded_at?->format('d M Y, h:i A') ?? null,
                        'responded_by' => $item->responded_by,
                        'admin_notes' => $item->admin_notes,
                        'ip_address' => $item->ip_address,
                        'created_at' => $item->created_at?->toISOString() ?? null,
                        'created_at_formatted' => $item->created_at?->format('d M Y, h:i A') ?? null,
                        'created_at_human' => $item->created_at?->diffForHumans() ?? null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $inquiries,
                'counts' => [
                    'total' => $totalCount,
                    'pending' => $pendingCount,
                    'responded' => $respondedCount,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve contact inquiries.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle inquiry operations: toggle_status, update_status, update_notes, delete.
     */
    public function handle(Request $request): JsonResponse
    {
        $action = $request->input('action', 'toggle_status');
        $id = (int)$request->input('id');

        if (!$id) {
            return response()->json([
                'success' => false,
                'message' => 'Inquiry ID is required.',
            ], 400);
        }

        try {
            $inquiry = ContactInquiry::findOrFail($id);
            $adminUser = $request->hasSession() ? $request->session()->get('admin_username', 'admin') : 'admin';

            // 1. Toggle status
            if ($action === 'toggle_status') {
                $newStatus = ($inquiry->status === 'responded') ? 'pending' : 'responded';
                $inquiry->status = $newStatus;
                $inquiry->responded_at = ($newStatus === 'responded') ? now() : null;
                $inquiry->responded_by = ($newStatus === 'responded') ? $adminUser : null;
                $inquiry->save();

                $statusLabel = ($newStatus === 'responded') ? 'responded' : 'pending response';

                return response()->json([
                    'success' => true,
                    'message' => "Inquiry marked as {$statusLabel}.",
                    'inquiry' => [
                        'id' => (int)$inquiry->id,
                        'status' => $inquiry->status,
                        'is_responded' => $inquiry->status === 'responded',
                        'responded_at' => $inquiry->responded_at?->toISOString() ?? null,
                        'responded_at_formatted' => $inquiry->responded_at?->format('d M Y, h:i A') ?? null,
                        'responded_by' => $inquiry->responded_by,
                    ],
                ]);
            }

            // 2. Set explicit status
            if ($action === 'update_status') {
                $targetStatus = $request->input('status') === 'responded' ? 'responded' : 'pending';
                $inquiry->status = $targetStatus;
                $inquiry->responded_at = ($targetStatus === 'responded') ? now() : null;
                $inquiry->responded_by = ($targetStatus === 'responded') ? $adminUser : null;
                $inquiry->save();

                return response()->json([
                    'success' => true,
                    'message' => "Status updated to {$targetStatus}.",
                    'inquiry' => [
                        'id' => (int)$inquiry->id,
                        'status' => $inquiry->status,
                        'is_responded' => $inquiry->status === 'responded',
                        'responded_at' => $inquiry->responded_at?->toISOString() ?? null,
                        'responded_at_formatted' => $inquiry->responded_at?->format('d M Y, h:i A') ?? null,
                        'responded_by' => $inquiry->responded_by,
                    ],
                ]);
            }

            // 3. Update notes
            if ($action === 'update_notes') {
                $notes = $request->input('admin_notes');
                $inquiry->admin_notes = $notes;
                $inquiry->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Admin notes saved successfully.',
                    'admin_notes' => $inquiry->admin_notes,
                ]);
            }

            // 4. Delete inquiry
            if ($action === 'delete') {
                $inquiry->status = 'deleted';
                $inquiry->save();
                $inquiry->delete(); // Soft delete

                return response()->json([
                    'success' => true,
                    'message' => 'Inquiry deleted successfully.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => "Unknown action '{$action}'.",
            ], 400);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Inquiry not found.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process inquiry request.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

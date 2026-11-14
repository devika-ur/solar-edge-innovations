<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agreement;
use App\Models\Quotation;
use App\Models\QuotationPayment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class QuotationController extends Controller
{
    /**
     * List all saved quotations with date filters, status, and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = trim((string)$request->query('search', ''));
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            $workflowStatus = trim((string)$request->query('workflow_status', ''));

            $query = Quotation::active()->with(['agreement', 'payment']);

            // Filter by workflow status (e.g. 'approved' for Approved Quotations tab)
            if (!empty($workflowStatus)) {
                $query->where('workflow_status', $workflowStatus);
            }

            // Date Range Filter
            if (!empty($startDate)) {
                try {
                    $parsedStart = Carbon::parse($startDate)->startOfDay();
                    $query->where('created_at', '>=', $parsedStart);
                } catch (\Throwable $e) {
                    // Ignore date parse errors
                }
            }

            if (!empty($endDate)) {
                try {
                    $parsedEnd = Carbon::parse($endDate)->endOfDay();
                    $query->where('created_at', '<=', $parsedEnd);
                } catch (\Throwable $e) {
                    // Ignore date parse errors
                }
            }

            // Search filter
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('client_name', 'like', "%{$search}%")
                        ->orWhere('ref_no', 'like', "%{$search}%")
                        ->orWhere('client_phone', 'like', "%{$search}%")
                        ->orWhere('client_address', 'like', "%{$search}%")
                        ->orWhere('capacity', 'like', "%{$search}%")
                        ->orWhere('system_type', 'like', "%{$search}%")
                        ->orWhere('total_amount', 'like', "%{$search}%");
                });
            }

            $quotations = $query->orderBy('id', 'desc')->get()->map(function ($item) {
                $status = $item->workflow_status ?: 'approval_pending';
                $isEditable = in_array($status, ['approval_pending', null, '']);
                $agreement = $item->agreement;
                $payment = $item->payment;

                return [
                    'id' => (int)$item->id,
                    'ref_no' => $item->ref_no ?: 'N/A',
                    'client_name' => $item->client_name,
                    'client_phone' => $item->client_phone ?: '-',
                    'client_address' => $item->client_address ?: '-',
                    'capacity' => $item->capacity ?: '-',
                    'system_type' => $item->system_type ?: '-',
                    'total_amount' => $item->total_amount ?: '-',
                    'quotation_date' => $item->quotation_date ?: $item->created_at?->format('d/m/Y'),
                    'pdf_url' => $item->pdf_url ? url($item->pdf_url) : null,
                    'has_pdf' => !empty($item->pdf_url),
                    'workflow_status' => $status,
                    'workflow_status_label' => match ($status) {
                        'approved' => 'Approved by Client',
                        'rejected' => 'Rejected by Client',
                        'agreement_created' => 'Agreement Created',
                        'completed' => 'Completed',
                        default => 'Quotation Approval Pending',
                    },
                    'is_editable' => $isEditable,
                    'approved_at' => $item->approved_at?->format('d M Y, h:i A'),
                    'rejected_at' => $item->rejected_at?->format('d M Y, h:i A'),
                    'rejection_reason' => $item->rejection_reason,
                    'agreement_created_at' => $item->agreement_created_at?->format('d M Y, h:i A'),
                    'completed_at' => $item->completed_at?->format('d M Y, h:i A'),
                    'has_agreement' => !empty($agreement),
                    'agreement_id' => $agreement?->id,
                    'agreement_pdf_url' => $agreement?->pdf_url ? url($agreement->pdf_url) : null,
                    'payment_status' => $payment?->status ?: 'pending',
                    'amount_paid' => (float)($payment?->amount_paid ?: 0),
                    'balance_amount' => (float)($payment?->balance_amount ?: 0),
                    'created_by' => $item->created_by ?: 'admin',
                    'created_at' => $item->created_at?->toISOString(),
                    'created_at_formatted' => $item->created_at?->format('d M Y, h:i A'),
                    'created_at_date' => $item->created_at?->format('Y-m-d'),
                    'created_at_human' => $item->created_at?->diffForHumans(),
                ];
            });

            // Summary stats across workflow
            $allActive = Quotation::active();
            $totalCount = (clone $allActive)->count();
            $pendingCount = (clone $allActive)->where(function ($q) {
                $q->whereNull('workflow_status')->orWhere('workflow_status', 'approval_pending');
            })->count();
            $approvedCount = (clone $allActive)->where('workflow_status', 'approved')->count();
            $rejectedCount = (clone $allActive)->where('workflow_status', 'rejected')->count();
            $agreementCount = (clone $allActive)->where('workflow_status', 'agreement_created')->count();
            $completedCount = (clone $allActive)->where('workflow_status', 'completed')->count();
            $todayCount = (clone $allActive)->whereDate('created_at', Carbon::today())->count();
            $thisMonthCount = (clone $allActive)->where('created_at', '>=', Carbon::now()->startOfMonth())->count();

            return response()->json([
                'success' => true,
                'data' => $quotations,
                'stats' => [
                    'total' => $totalCount,
                    'pending_approval' => $pendingCount,
                    'approved' => $approvedCount,
                    'rejected' => $rejectedCount,
                    'agreement_created' => $agreementCount,
                    'completed' => $completedCount,
                    'today' => $todayCount,
                    'this_month' => $thisMonthCount,
                    'filtered_count' => $quotations->count(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve quotations history.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate the next sequential quotation reference number.
     * Format: DCR:MM-YY-XX (e.g. DCR:11-26-01, DCR:12-26-01, DCR:01-27-04)
     */
    public function nextRef(Request $request): JsonResponse
    {
        try {
            $date = $request->query('date') ?: $request->input('date');
            $prefix = $request->query('prefix', 'DCR:');

            $nextRef = Quotation::generateNextRefNo($date, $prefix);
            $parsedDate = Quotation::parseDateHelper($date);

            return response()->json([
                'success' => true,
                'ref_no' => $nextRef,
                'month' => $parsedDate->format('m'),
                'year' => $parsedDate->format('y'),
                'date_formatted' => $parsedDate->format('d/m/Y'),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate next quotation reference number.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store or update a quotation with full JSON data and generated PDF.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $id = (int)$request->input('id');
            $existing = null;

            if ($id > 0) {
                $existing = Quotation::findOrFail($id);

                // Enforce: quotations can only be edited while 'approval_pending'
                if (!in_array($existing->workflow_status, ['approval_pending', null, '']) && !$request->boolean('force_edit')) {
                    $statusLabel = match ($existing->workflow_status) {
                        'approved' => 'Approved by Client',
                        'rejected' => 'Rejected by Client',
                        'agreement_created' => 'Agreement Created',
                        'completed' => 'Completed',
                        default => $existing->workflow_status,
                    };
                    return response()->json([
                        'success' => false,
                        'message' => "Quotation #{$existing->ref_no} cannot be edited because it is currently '{$statusLabel}'. Reopen it first before modifying.",
                    ], 422);
                }
            }

            $clientName = trim((string)$request->input('client_name', ''));
            if (empty($clientName)) {
                $clientName = 'Client ' . date('d-m-Y');
            }

            $quotationDate = trim((string)$request->input('quotation_date', date('d/m/Y')));
            $refNo = trim((string)$request->input('ref_no', ''));
            if (empty($refNo) || $refNo === 'N/A' || ($refNo === 'DCR:09-26-13' && !$existing)) {
                $refNo = $existing ? $existing->ref_no : Quotation::generateNextRefNo($quotationDate);
            }

            $clientPhone = trim((string)$request->input('client_phone', ''));
            $clientAddress = trim((string)$request->input('client_address', ''));
            $capacity = trim((string)$request->input('capacity', ''));
            $systemType = trim((string)$request->input('system_type', ''));
            $totalAmount = trim((string)$request->input('total_amount', ''));

            // Parse quotation form JSON configuration
            $quotationDataRaw = $request->input('quotation_data');
            $quotationData = is_string($quotationDataRaw) ? json_decode($quotationDataRaw, true) : (is_array($quotationDataRaw) ? $quotationDataRaw : null);

            $adminUser = $request->hasSession() ? $request->session()->get('admin_username', 'admin') : 'admin';

            // Ensure destination directory exists
            $uploadDir = public_path('uploads/quotations');
            if (!File::isDirectory($uploadDir)) {
                File::makeDirectory($uploadDir, 0755, true, true);
            }

            $pdfPath = $existing ? $existing->pdf_path : null;
            $pdfUrl = $existing ? $existing->pdf_url : null;

            // Handle direct file upload or base64 data
            if ($request->hasFile('pdf_file')) {
                $file = $request->file('pdf_file');
                $filename = 'quote_' . Str::slug($clientName ?: 'quote') . '_' . time() . '.pdf';
                $file->move($uploadDir, $filename);
                $pdfPath = 'uploads/quotations/' . $filename;
                $pdfUrl = '/uploads/quotations/' . $filename;
            } elseif ($request->filled('pdf_base64')) {
                $base64 = $request->input('pdf_base64');
                if (str_contains($base64, ',')) {
                    $base64 = explode(',', $base64)[1];
                }
                $decoded = base64_decode($base64);
                if ($decoded !== false) {
                    $cleanRef = preg_replace('/[^A-Za-z0-9_\-]/', '_', $refNo) ?: 'ref';
                    $cleanName = Str::slug($clientName) ?: 'client';
                    $filename = "quotation_{$cleanName}_{$cleanRef}_" . time() . ".pdf";
                    File::put($uploadDir . '/' . $filename, $decoded);
                    $pdfPath = 'uploads/quotations/' . $filename;
                    $pdfUrl = '/uploads/quotations/' . $filename;
                }
            }

            if ($existing) {
                $existing->ref_no = $refNo;
                $existing->client_name = $clientName;
                $existing->client_phone = $clientPhone;
                $existing->client_address = $clientAddress;
                $existing->capacity = $capacity;
                $existing->system_type = $systemType;
                $existing->total_amount = $totalAmount;
                $existing->quotation_date = $quotationDate;
                if ($quotationData) {
                    $existing->quotation_data = $quotationData;
                }
                if ($pdfPath) {
                    $existing->pdf_path = $pdfPath;
                    $existing->pdf_url = $pdfUrl;
                }
                $existing->save();
                $quotation = $existing;
                $actionMessage = "Quotation #{$quotation->ref_no} for '{$clientName}' updated successfully.";
            } else {
                $quotation = Quotation::create([
                    'ref_no' => $refNo ?: 'N/A',
                    'client_name' => $clientName,
                    'client_phone' => $clientPhone,
                    'client_address' => $clientAddress,
                    'capacity' => $capacity,
                    'system_type' => $systemType,
                    'total_amount' => $totalAmount,
                    'quotation_data' => $quotationData,
                    'quotation_date' => $quotationDate,
                    'pdf_path' => $pdfPath,
                    'pdf_url' => $pdfUrl,
                    'status' => 'active',
                    'workflow_status' => 'approval_pending',
                    'created_by' => $adminUser,
                ]);
                $actionMessage = "Quotation for '{$clientName}' saved successfully to history.";
            }

            return response()->json([
                'success' => true,
                'message' => $actionMessage,
                'data' => [
                    'id' => (int)$quotation->id,
                    'ref_no' => $quotation->ref_no,
                    'client_name' => $quotation->client_name,
                    'workflow_status' => $quotation->workflow_status,
                    'pdf_url' => $quotation->pdf_url ? url($quotation->pdf_url) : null,
                    'created_at_formatted' => $quotation->created_at?->format('d M Y, h:i A'),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save quotation.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single quotation by ID including full quotation_data and workflow details.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $quotation = Quotation::with(['agreement', 'payment'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => (int)$quotation->id,
                    'ref_no' => $quotation->ref_no,
                    'client_name' => $quotation->client_name,
                    'client_phone' => $quotation->client_phone,
                    'client_address' => $quotation->client_address,
                    'capacity' => $quotation->capacity,
                    'system_type' => $quotation->system_type,
                    'total_amount' => $quotation->total_amount,
                    'quotation_date' => $quotation->quotation_date,
                    'quotation_data' => $quotation->quotation_data,
                    'pdf_url' => $quotation->pdf_url ? url($quotation->pdf_url) : null,
                    'status' => $quotation->status,
                    'workflow_status' => $quotation->workflow_status ?: 'approval_pending',
                    'is_editable' => in_array($quotation->workflow_status, ['approval_pending', null, '']),
                    'approved_at' => $quotation->approved_at?->format('d M Y, h:i A'),
                    'rejected_at' => $quotation->rejected_at?->format('d M Y, h:i A'),
                    'rejection_reason' => $quotation->rejection_reason,
                    'agreement_created_at' => $quotation->agreement_created_at?->format('d M Y, h:i A'),
                    'completed_at' => $quotation->completed_at?->format('d M Y, h:i A'),
                    'has_agreement' => !empty($quotation->agreement),
                    'agreement' => $quotation->agreement,
                    'payment' => $quotation->payment,
                    'created_by' => $quotation->created_by,
                    'created_at_formatted' => $quotation->created_at?->format('d M Y, h:i A'),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Quotation not found.',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Mark quotation as Approved by Client.
     */
    public function approve(Request $request, ?int $id = null): JsonResponse
    {
        try {
            $quoteId = $id ?: (int)$request->input('id');
            $quotation = Quotation::findOrFail($quoteId);
            $quotation->workflow_status = 'approved';
            $quotation->approved_at = Carbon::now();
            $quotation->rejected_at = null;
            $quotation->rejection_reason = null;
            $quotation->save();

            return response()->json([
                'success' => true,
                'message' => "Quotation #{$quotation->ref_no} for '{$quotation->client_name}' marked as 'Approved by Client'! It is now ready for Agreement generation.",
                'data' => [
                    'id' => $quotation->id,
                    'workflow_status' => $quotation->workflow_status,
                    'approved_at' => $quotation->approved_at->format('d M Y, h:i A'),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve quotation.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark quotation as Rejected by Client.
     */
    public function reject(Request $request, ?int $id = null): JsonResponse
    {
        try {
            $quoteId = $id ?: (int)$request->input('id');
            $quotation = Quotation::findOrFail($quoteId);
            $reason = trim((string)$request->input('reason', 'Client rejected the quotation'));

            $quotation->workflow_status = 'rejected';
            $quotation->rejected_at = Carbon::now();
            $quotation->rejection_reason = $reason;
            $quotation->save();

            return response()->json([
                'success' => true,
                'message' => "Quotation #{$quotation->ref_no} for '{$quotation->client_name}' marked as 'Rejected by Client'.",
                'data' => [
                    'id' => $quotation->id,
                    'workflow_status' => $quotation->workflow_status,
                    'rejected_at' => $quotation->rejected_at->format('d M Y, h:i A'),
                    'reason' => $reason,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject quotation.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reopen an approved/rejected quotation so it can be edited.
     */
    public function reopen(Request $request, ?int $id = null): JsonResponse
    {
        try {
            $quoteId = $id ?: (int)$request->input('id');
            $quotation = Quotation::findOrFail($quoteId);
            $quotation->workflow_status = 'approval_pending';
            $quotation->rejection_reason = null;
            $quotation->save();

            return response()->json([
                'success' => true,
                'message' => "Quotation #{$quotation->ref_no} reopened! It can now be edited.",
                'data' => [
                    'id' => $quotation->id,
                    'workflow_status' => $quotation->workflow_status,
                    'is_editable' => true,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reopen quotation.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Application Tracking API: Consolidated progress and chronological timeline for all applicants.
     */
    public function tracking(Request $request): JsonResponse
    {
        try {
            $search = trim((string)$request->query('search', ''));
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            $statusFilter = trim((string)$request->query('status', ''));

            $query = Quotation::active()->with(['agreement', 'payment.paymentHistories']);

            // Date Range Filter based on application creation
            if (!empty($startDate)) {
                try {
                    $query->where('created_at', '>=', Carbon::parse($startDate)->startOfDay());
                } catch (\Throwable $e) {}
            }
            if (!empty($endDate)) {
                try {
                    $query->where('created_at', '<=', Carbon::parse($endDate)->endOfDay());
                } catch (\Throwable $e) {}
            }

            // Search filter
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('client_name', 'like', "%{$search}%")
                        ->orWhere('ref_no', 'like', "%{$search}%")
                        ->orWhere('client_phone', 'like', "%{$search}%")
                        ->orWhere('client_address', 'like', "%{$search}%");
                });
            }

            if (!empty($statusFilter)) {
                $query->where('workflow_status', $statusFilter);
            }

            $applications = $query->orderBy('id', 'desc')->get()->map(function ($q) {
                $status = $q->workflow_status ?: 'approval_pending';
                $payment = $q->payment;
                $agreement = $q->agreement;

                // 1. Stage 1: Quotation Approval Pending
                $stage1 = [
                    'stage' => 1,
                    'key' => 'quotation_created',
                    'title' => 'Quotation Approval Pending',
                    'is_completed' => true,
                    'is_current' => ($status === 'approval_pending'),
                    'date' => $q->created_at?->format('d M Y, h:i A'),
                    'details' => "Quote #{$q->ref_no} ({$q->capacity}) created on {$q->quotation_date}",
                    'pdf_url' => $q->pdf_url ? url($q->pdf_url) : null,
                ];

                // 2. Stage 2: Approved by Client / Rejected by Client
                $isApproved = in_array($status, ['approved', 'agreement_created', 'completed']);
                $isRejected = ($status === 'rejected');
                $stage2 = [
                    'stage' => 2,
                    'key' => 'client_approval',
                    'title' => $isRejected ? 'Rejected by Client' : ($isApproved ? 'Approved by Client' : 'Client Approval'),
                    'is_completed' => ($isApproved || $isRejected),
                    'is_current' => ($status === 'approved' || $status === 'rejected'),
                    'is_rejected' => $isRejected,
                    'date' => $isRejected ? $q->rejected_at?->format('d M Y, h:i A') : ($q->approved_at?->format('d M Y, h:i A')),
                    'details' => $isRejected
                        ? ($q->rejection_reason ?: 'Client declined quotation')
                        : ($isApproved ? 'Client accepted quotation & specifications' : 'Pending client approval'),
                ];

                // 3. Stage 3: Agreement Created
                $hasAgreement = !empty($agreement) || in_array($status, ['agreement_created', 'completed']);
                $stage3 = [
                    'stage' => 3,
                    'key' => 'agreement_created',
                    'title' => 'Agreement Created',
                    'is_completed' => $hasAgreement,
                    'is_current' => ($status === 'agreement_created' && (!$payment || $payment->status !== 'paid')),
                    'date' => $q->agreement_created_at?->format('d M Y, h:i A') ?: $agreement?->created_at?->format('d M Y, h:i A'),
                    'details' => $hasAgreement
                        ? "Model RTS Agreement executed for {$q->client_name}"
                        : ($isRejected ? 'Cannot proceed (Quotation was rejected)' : 'Eligible after client approval'),
                    'pdf_url' => $agreement?->pdf_url ? url($agreement->pdf_url) : null,
                ];

                // 4. Stage 4: Payment Status
                $paymentStatus = $payment?->status ?: 'pending';
                $isPaid = ($paymentStatus === 'paid');
                $isPartial = ($paymentStatus === 'partially_paid');
                $stage4 = [
                    'stage' => 4,
                    'key' => 'payment_status',
                    'title' => 'Payment Status',
                    'status' => $paymentStatus,
                    'status_label' => match ($paymentStatus) {
                        'paid' => 'Fully Paid',
                        'partially_paid' => 'Partially Paid',
                        default => 'Payment Pending',
                    },
                    'is_completed' => $isPaid,
                    'is_current' => ($hasAgreement && !$isPaid),
                    'date' => $payment?->last_payment_date?->format('d M Y, h:i A'),
                    'total_amount' => (float)($payment?->total_amount ?: 0),
                    'amount_paid' => (float)($payment?->amount_paid ?: 0),
                    'balance_amount' => (float)($payment?->balance_amount ?: 0),
                    'transactions_count' => $payment ? $payment->paymentHistories()->count() : 0,
                    'details' => $payment
                        ? "Paid ₹" . number_format($payment->amount_paid) . " of ₹" . number_format($payment->total_amount) . " (Balance: ₹" . number_format($payment->balance_amount) . ")"
                        : ($hasAgreement ? 'Awaiting initial payment' : 'Eligible after agreement creation'),
                ];

                // 5. Stage 5: Completed
                $isCompleted = ($status === 'completed' || ($hasAgreement && $isPaid));
                $stage5 = [
                    'stage' => 5,
                    'key' => 'completed',
                    'title' => 'Completed',
                    'is_completed' => $isCompleted,
                    'is_current' => $isCompleted,
                    'date' => $q->completed_at?->format('d M Y, h:i A') ?: ($isPaid ? $payment?->last_payment_date?->format('d M Y, h:i A') : null),
                    'details' => $isCompleted
                        ? 'All workflow stages complete: Quotation approved, Agreement executed, and Full Payment received.'
                        : 'Application is ongoing.',
                ];

                return [
                    'id' => $q->id,
                    'ref_no' => $q->ref_no ?: 'N/A',
                    'client_name' => $q->client_name,
                    'client_phone' => $q->client_phone ?: '-',
                    'client_address' => $q->client_address ?: '-',
                    'capacity' => $q->capacity ?: '-',
                    'system_type' => $q->system_type ?: '-',
                    'total_amount' => $q->total_amount ?: '-',
                    'quotation_date' => $q->quotation_date ?: $q->created_at?->format('d/m/Y'),
                    'workflow_status' => $status,
                    'workflow_status_label' => match ($status) {
                        'approved' => 'Approved by Client',
                        'rejected' => 'Rejected by Client',
                        'agreement_created' => 'Agreement Created',
                        'completed' => 'Completed',
                        default => 'Quotation Approval Pending',
                    },
                    'created_at_formatted' => $q->created_at?->format('d M Y, h:i A'),
                    'created_at_date' => $q->created_at?->format('Y-m-d'),
                    'pdf_url' => $q->pdf_url ? url($q->pdf_url) : null,
                    'has_agreement' => $hasAgreement,
                    'agreement_id' => $agreement?->id,
                    'agreement_pdf_url' => $agreement?->pdf_url ? url($agreement->pdf_url) : null,
                    'payment_status' => $paymentStatus,
                    'amount_paid' => (float)($payment?->amount_paid ?: 0),
                    'balance_amount' => (float)($payment?->balance_amount ?: 0),
                    'stages' => [$stage1, $stage2, $stage3, $stage4, $stage5],
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $applications,
                'total' => $applications->count(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load application tracking.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle actions such as delete.
     */
    public function handle(Request $request): JsonResponse
    {
        $action = $request->input('action', 'delete');
        $id = (int)$request->input('id');

        if (!$id) {
            return response()->json([
                'success' => false,
                'message' => 'Quotation ID is required.',
            ], 400);
        }

        try {
            $quotation = Quotation::findOrFail($id);

            if ($action === 'delete') {
                if ($quotation->pdf_path && File::exists(public_path($quotation->pdf_path))) {
                    @File::delete(public_path($quotation->pdf_path));
                }

                $quotation->status = 'deleted';
                $quotation->save();
                $quotation->delete(); // Soft delete

                return response()->json([
                    'success' => true,
                    'message' => "Quotation #{$quotation->ref_no} ({$quotation->client_name}) deleted from history.",
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => "Unsupported action '{$action}'.",
            ], 400);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process quotation request.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentHistory;
use App\Models\Quotation;
use App\Models\QuotationPayment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * List all quotation payment masters with stats and filters.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Auto-sync any active quotations that do not yet have a payment master record
            $activeQuotations = Quotation::active()->get();
            $existingMasterQuotationIds = QuotationPayment::pluck('quotation_id')->all();
            $existingMasterLookup = array_flip($existingMasterQuotationIds);

            foreach ($activeQuotations as $quote) {
                if (!isset($existingMasterLookup[$quote->id])) {
                    QuotationPayment::syncForQuotation($quote);
                }
            }

            $search = trim((string)$request->query('search', ''));
            $status = trim((string)$request->query('status', ''));
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            $query = QuotationPayment::whereHas('quotation', function ($q) {
                $q->active();
            })->with(['quotation']);

            // Filter by Status: pending, partially_paid, paid
            if (!empty($status) && in_array(strtolower($status), ['pending', 'partially_paid', 'paid'])) {
                $query->where('status', strtolower($status));
            }

            // Date Range Filter (based on quotation created_at or last_payment_date)
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
                        ->orWhere('client_phone', 'like', "%{$search}%");
                });
            }

            $payments = $query->orderBy('id', 'desc')->get()->map(function ($item) {
                $quote = $item->quotation;
                return [
                    'id' => (int)$item->id,
                    'quotation_id' => (int)$item->quotation_id,
                    'ref_no' => $item->ref_no ?: ($quote?->ref_no ?: 'N/A'),
                    'client_name' => $item->client_name ?: ($quote?->client_name ?: 'Unnamed Customer'),
                    'client_phone' => $item->client_phone ?: ($quote?->client_phone ?: '-'),
                    'capacity' => $quote?->capacity ?: '-',
                    'system_type' => $quote?->system_type ?: '-',
                    'quotation_date' => $quote?->quotation_date ?: $item->created_at?->format('d/m/Y'),
                    'total_amount' => (float)$item->total_amount,
                    'amount_paid' => (float)$item->amount_paid,
                    'balance_amount' => (float)$item->balance_amount,
                    'status' => $item->status,
                    'status_label' => match ($item->status) {
                        'paid' => 'Paid',
                        'partially_paid' => 'Partially Paid',
                        default => 'Pending',
                    },
                    'last_payment_date' => $item->last_payment_date?->toISOString(),
                    'last_payment_date_formatted' => $item->last_payment_date ? $item->last_payment_date->format('d M Y, h:i A') : 'No payments yet',
                    'remarks' => $item->notes,
                    'transactions_count' => $item->paymentHistories()->count(),
                    'created_at_formatted' => $item->created_at?->format('d M Y, h:i A'),
                ];
            });

            // Calculate overall master stats across all active quotations
            $allActiveMasters = QuotationPayment::whereHas('quotation', function ($q) {
                $q->active();
            })->get();

            $totalQuotations = $allActiveMasters->count();
            $totalAmount = (float)$allActiveMasters->sum('total_amount');
            $totalPaid = (float)$allActiveMasters->sum('amount_paid');
            $totalBalance = (float)$allActiveMasters->sum('balance_amount');
            $pendingCount = $allActiveMasters->where('status', 'pending')->count();
            $partiallyPaidCount = $allActiveMasters->where('status', 'partially_paid')->count();
            $paidCount = $allActiveMasters->where('status', 'paid')->count();

            return response()->json([
                'success' => true,
                'data' => $payments,
                'stats' => [
                    'total_quotations' => $totalQuotations,
                    'total_amount' => round($totalAmount, 2),
                    'total_paid' => round($totalPaid, 2),
                    'total_balance' => round($totalBalance, 2),
                    'pending_count' => $pendingCount,
                    'partially_paid_count' => $partiallyPaidCount,
                    'paid_count' => $paidCount,
                    'filtered_count' => $payments->count(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load payments.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new payment transaction against a quotation.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'quotation_id' => 'required|integer',
            'payment_amount' => 'required|numeric',
        ]);

        $quotationId = (int)$request->input('quotation_id');
        $paymentAmount = round((float)$request->input('payment_amount'), 2);
        $paymentMethod = trim((string)$request->input('payment_method', 'Cash')) ?: 'Cash';
        $transactionReference = trim((string)$request->input('transaction_reference', '')) ?: null;
        $notes = trim((string)$request->input('notes', '')) ?: null;

        $paymentDateInput = $request->input('payment_date');
        $paymentDate = !empty($paymentDateInput) ? Carbon::parse($paymentDateInput) : Carbon::now();

        $adminUser = $request->hasSession() ? $request->session()->get('admin_username', 'admin') : 'admin';

        // Check payment amount is > 0
        if ($paymentAmount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Payment amount must be greater than 0.',
            ], 422);
        }

        $newTotalAmount = $request->filled('new_total_amount') ? round((float)$request->input('new_total_amount'), 2) : null;
        $totalRemarks = trim((string)$request->input('total_remarks', '')) ?: null;

        try {
            $quotation = Quotation::active()->findOrFail($quotationId);

            // Execute in transaction with lock
            $result = DB::transaction(function () use (
                $quotation,
                $paymentAmount,
                $paymentMethod,
                $transactionReference,
                $paymentDate,
                $notes,
                $adminUser,
                $newTotalAmount,
                $totalRemarks
            ) {
                // Ensure master record exists and lock it
                $master = QuotationPayment::where('quotation_id', $quotation->id)->lockForUpdate()->first();
                if (!$master) {
                    $master = QuotationPayment::syncForQuotation($quotation);
                    // Re-query with lock
                    $master = QuotationPayment::where('id', $master->id)->lockForUpdate()->first();
                }

                // If total amount is being edited/reduced
                if ($newTotalAmount !== null && $newTotalAmount > 0 && $newTotalAmount != (float)$master->total_amount) {
                    if ($newTotalAmount < (float)$master->amount_paid) {
                        $paidFmt = number_format($master->amount_paid, 2);
                        throw new \InvalidArgumentException("New quotation total (₹" . number_format($newTotalAmount, 2) . ") cannot be less than already paid amount of ₹{$paidFmt}.");
                    }
                    $master->total_amount = $newTotalAmount;
                    if (!empty($totalRemarks)) {
                        $master->notes = $totalRemarks;
                    }
                    $quotation->total_amount = number_format($newTotalAmount, 0, '.', ',');
                    $quotation->save();
                }

                $currentBalance = round((float)$master->total_amount - (float)$master->amount_paid, 2);
                $master->balance_amount = $currentBalance;

                // Overpayment validation
                if ($currentBalance <= 0) {
                    throw new \InvalidArgumentException("This quotation is already fully paid. Balance is ₹0.00.");
                }

                if ($paymentAmount > $currentBalance) {
                    $formattedBalance = number_format($currentBalance, 2);
                    $formattedInput = number_format($paymentAmount, 2);
                    throw new \InvalidArgumentException("Payment amount (₹{$formattedInput}) cannot exceed the current outstanding balance of ₹{$formattedBalance}.");
                }

                // Calculate updated amounts
                $newPaid = round((float)$master->amount_paid + $paymentAmount, 2);
                $newBalance = max(0.00, round((float)$master->total_amount - $newPaid, 2));

                $newStatus = 'partially_paid';
                if ($newBalance <= 0) {
                    $newStatus = 'paid';
                } elseif ($newPaid <= 0) {
                    $newStatus = 'pending';
                }

                // 1. Create entry in payment_histories table
                $history = PaymentHistory::create([
                    'quotation_payment_id' => $master->id,
                    'quotation_id' => $quotation->id,
                    'payment_amount' => $paymentAmount,
                    'total_paid_after' => $newPaid,
                    'balance_after' => $newBalance,
                    'payment_method' => $paymentMethod,
                    'transaction_reference' => $transactionReference,
                    'payment_date' => $paymentDate,
                    'notes' => $notes,
                    'recorded_by' => $adminUser,
                ]);

                // 2. Update master record in quotation_payments table
                $master->amount_paid = $newPaid;
                $master->balance_amount = $newBalance;
                $master->status = $newStatus;
                $master->last_payment_date = $paymentDate;
                $master->save();

                return [
                    'master' => $master,
                    'history' => $history,
                ];
            });

            /** @var QuotationPayment $master */
            $master = $result['master'];
            /** @var PaymentHistory $history */
            $history = $result['history'];

            $formattedAmount = number_format($paymentAmount, 2);
            return response()->json([
                'success' => true,
                'message' => "Payment of ₹{$formattedAmount} recorded successfully for {$master->client_name}.",
                'data' => [
                    'payment' => [
                        'id' => (int)$master->id,
                        'quotation_id' => (int)$master->quotation_id,
                        'client_name' => $master->client_name,
                        'ref_no' => $master->ref_no,
                        'total_amount' => (float)$master->total_amount,
                        'amount_paid' => (float)$master->amount_paid,
                        'balance_amount' => (float)$master->balance_amount,
                        'status' => $master->status,
                        'status_label' => match ($master->status) {
                            'paid' => 'Paid',
                            'partially_paid' => 'Partially Paid',
                            default => 'Pending',
                        },
                        'last_payment_date_formatted' => $master->last_payment_date?->format('d M Y, h:i A'),
                    ],
                    'transaction' => [
                        'id' => (int)$history->id,
                        'payment_amount' => (float)$history->payment_amount,
                        'total_paid_after' => (float)$history->total_paid_after,
                        'balance_after' => (float)$history->balance_after,
                        'payment_method' => $history->payment_method,
                        'transaction_reference' => $history->transaction_reference,
                        'payment_date' => $history->payment_date?->toISOString(),
                        'payment_date_formatted' => $history->payment_date?->format('d M Y, h:i A'),
                        'notes' => $history->notes,
                        'recorded_by' => $history->recorded_by,
                    ],
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retrieve payment history transactions for a quotation.
     */
    public function history(Request $request, ?int $id = null): JsonResponse
    {
        try {
            $targetId = $id ?: (int)$request->query('id', $request->query('quotation_id', 0));

            if (!$targetId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quotation or Payment ID is required.',
                ], 400);
            }

            // Can be queried by quotation_id or master id
            $master = QuotationPayment::where('quotation_id', $targetId)
                ->orWhere('id', $targetId)
                ->with(['quotation', 'paymentHistories'])
                ->first();

            if (!$master) {
                // Check if quotation exists, and sync master on the fly
                $quotation = Quotation::active()->find($targetId);
                if ($quotation) {
                    $master = QuotationPayment::syncForQuotation($quotation);
                    $master->load(['quotation', 'paymentHistories']);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment record or quotation not found.',
                    ], 404);
                }
            }

            $quote = $master->quotation;

            $histories = $master->paymentHistories->map(function ($item) {
                return [
                    'id' => (int)$item->id,
                    'payment_amount' => (float)$item->payment_amount,
                    'total_paid_after' => (float)$item->total_paid_after,
                    'balance_after' => (float)$item->balance_after,
                    'payment_method' => $item->payment_method ?: 'Cash',
                    'transaction_reference' => $item->transaction_reference,
                    'payment_date' => $item->payment_date?->toISOString(),
                    'payment_date_formatted' => $item->payment_date?->format('d M Y, h:i A'),
                    'payment_date_human' => $item->payment_date?->diffForHumans(),
                    'notes' => $item->notes,
                    'recorded_by' => $item->recorded_by ?: 'admin',
                    'created_at' => $item->created_at?->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'master' => [
                        'id' => (int)$master->id,
                        'quotation_id' => (int)$master->quotation_id,
                        'ref_no' => $master->ref_no ?: ($quote?->ref_no ?: 'N/A'),
                        'client_name' => $master->client_name ?: ($quote?->client_name ?: 'Unnamed Customer'),
                        'client_phone' => $master->client_phone ?: ($quote?->client_phone ?: '-'),
                        'total_amount' => (float)$master->total_amount,
                        'amount_paid' => (float)$master->amount_paid,
                        'balance_amount' => (float)$master->balance_amount,
                        'status' => $master->status,
                        'status_label' => match ($master->status) {
                            'paid' => 'Paid',
                            'partially_paid' => 'Partially Paid',
                            default => 'Pending',
                        },
                        'last_payment_date_formatted' => $master->last_payment_date ? $master->last_payment_date->format('d M Y, h:i A') : 'No payments yet',
                        'transactions_count' => $histories->count(),
                    ],
                    'histories' => $histories,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load payment history.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single payment master by ID or quotation ID.
     */
    public function show(Request $request, ?int $id = null): JsonResponse
    {
        try {
            $targetId = $id ?: (int)$request->query('id', $request->query('quotation_id', 0));

            if (!$targetId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quotation or Payment ID is required.',
                ], 400);
            }

            $master = QuotationPayment::where('id', $targetId)
                ->orWhere('quotation_id', $targetId)
                ->with(['quotation'])
                ->firstOrFail();

            $quote = $master->quotation;

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => (int)$master->id,
                    'quotation_id' => (int)$master->quotation_id,
                    'ref_no' => $master->ref_no ?: ($quote?->ref_no ?: 'N/A'),
                    'client_name' => $master->client_name ?: ($quote?->client_name ?: 'Unnamed Customer'),
                    'client_phone' => $master->client_phone ?: ($quote?->client_phone ?: '-'),
                    'total_amount' => (float)$master->total_amount,
                    'amount_paid' => (float)$master->amount_paid,
                    'balance_amount' => (float)$master->balance_amount,
                    'status' => $master->status,
                    'status_label' => match ($master->status) {
                        'paid' => 'Paid',
                        'partially_paid' => 'Partially Paid',
                        default => 'Pending',
                    },
                    'last_payment_date_formatted' => $master->last_payment_date ? $master->last_payment_date->format('d M Y, h:i A') : 'No payments yet',
                    'transactions_count' => $master->paymentHistories()->count(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment record not found.',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update quotation total amount with remarks (e.g. negotiated discount or price reduction).
     */
    public function updateTotal(Request $request): JsonResponse
    {
        $request->validate([
            'quotation_id' => 'required|integer',
            'total_amount' => 'required|numeric',
        ]);

        $quotationId = (int)$request->input('quotation_id');
        $newTotal = round((float)$request->input('total_amount'), 2);
        $remarks = trim((string)$request->input('remarks', ''));

        if ($newTotal <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Total amount must be greater than 0.',
            ], 422);
        }

        try {
            $master = QuotationPayment::where('quotation_id', $quotationId)
                ->orWhere('id', $quotationId)
                ->firstOrFail();

            $quotation = Quotation::active()->findOrFail($master->quotation_id);

            // Validation: new total cannot be less than already paid
            if ($newTotal < (float)$master->amount_paid) {
                $paidFormatted = number_format($master->amount_paid, 2);
                $newFormatted = number_format($newTotal, 2);
                return response()->json([
                    'success' => false,
                    'message' => "Total amount (₹{$newFormatted}) cannot be less than the amount already paid (₹{$paidFormatted}).",
                ], 422);
            }

            $oldTotal = (float)$master->total_amount;
            $newBalance = max(0.00, round($newTotal - (float)$master->amount_paid, 2));

            $newStatus = 'pending';
            if ($newBalance <= 0 && $newTotal > 0) {
                $newStatus = 'paid';
            } elseif ((float)$master->amount_paid > 0) {
                $newStatus = 'partially_paid';
            }

            $master->total_amount = $newTotal;
            $master->balance_amount = $newBalance;
            $master->status = $newStatus;
            if (!empty($remarks)) {
                $master->notes = $remarks;
            }
            $master->save();

            $quotation->total_amount = number_format($newTotal, 0, '.', ',');
            $quotation->save();

            return response()->json([
                'success' => true,
                'message' => "Quotation total updated to ₹" . number_format($newTotal, 2) . " successfully.",
                'data' => [
                    'id' => (int)$master->id,
                    'quotation_id' => (int)$master->quotation_id,
                    'total_amount' => (float)$master->total_amount,
                    'amount_paid' => (float)$master->amount_paid,
                    'balance_amount' => (float)$master->balance_amount,
                    'status' => $master->status,
                    'status_label' => match ($master->status) {
                        'paid' => 'Paid',
                        'partially_paid' => 'Partially Paid',
                        default => 'Pending',
                    },
                    'notes' => $master->notes,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update quotation total amount.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

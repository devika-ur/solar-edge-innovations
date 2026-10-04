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

class ReportController extends Controller
{
    /**
     * Ensure active quotations are synced to quotation_payments masters.
     */
    protected function ensureMastersSynced(): void
    {
        try {
            $activeQuotations = Quotation::active()->get();
            $existingMasterLookup = array_flip(QuotationPayment::pluck('quotation_id')->all());

            foreach ($activeQuotations as $quote) {
                if (!isset($existingMasterLookup[$quote->id])) {
                    QuotationPayment::syncForQuotation($quote);
                }
            }
        } catch (\Throwable $e) {
            // Silently fail if DB table is syncing
        }
    }

    /**
     * Parse date string flexibly (YYYY-MM-DD or DD/MM/YYYY).
     */
    protected function parseDate(?string $dateStr, bool $isEnd = false): ?Carbon
    {
        if (empty($dateStr)) {
            return null;
        }

        try {
            // Check if format is DD/MM/YYYY
            if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', trim($dateStr), $m)) {
                $carbon = Carbon::createFromDate((int)$m[3], (int)$m[2], (int)$m[1]);
            } else {
                $carbon = Carbon::parse(trim($dateStr));
            }

            return $isEnd ? $carbon->endOfDay() : $carbon->startOfDay();
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Normalize payment status query parameter.
     */
    protected function normalizeStatus(?string $status): ?string
    {
        if (empty($status) || strtolower($status) === 'all') {
            return null;
        }

        $s = strtolower(str_replace([' ', '-'], '_', trim($status)));
        if (in_array($s, ['pending', 'partially_paid', 'paid'])) {
            return $s;
        }

        return null;
    }

    /**
     * Dedicated Payment History Report API (Non-paginated).
     * Returns flat payment transaction records with server-side filtering and summary.
     */
    public function paymentHistory(Request $request): JsonResponse
    {
        $this->ensureMastersSynced();

        $fromDate = $this->parseDate($request->query('fromDate') ?: $request->query('start_date'));
        $toDate = $this->parseDate($request->query('toDate') ?: $request->query('end_date'), true);
        $customer = trim((string)($request->query('customer') ?: $request->query('customerId') ?: ''));
        $quotationNumber = trim((string)($request->query('quotationNumber') ?: $request->query('ref_no') ?: ''));
        $status = $this->normalizeStatus($request->query('status') ?: $request->query('paymentStatus'));

        $records = [];
        $distinctQuoteIds = [];
        $totalQuotationAmountMap = [];
        $totalPaidSum = 0.0;
        $totalTxCount = 0;

        // 1. If status is NOT 'pending', query actual payment transactions
        if ($status !== 'pending') {
            $txQuery = PaymentHistory::with(['quotation', 'quotationPayment'])
                ->whereHas('quotation', function ($q) {
                    $q->active();
                });

            // Date filtering on payment_date
            if ($fromDate) {
                $txQuery->where('payment_date', '>=', $fromDate);
            }
            if ($toDate) {
                $txQuery->where('payment_date', '<=', $toDate);
            }

            // Customer filtering
            if (!empty($customer)) {
                $txQuery->whereHas('quotation', function ($q) use ($customer) {
                    $q->where('client_name', 'like', "%{$customer}%")
                        ->orWhere('client_phone', 'like', "%{$customer}%")
                        ->orWhere('id', $customer);
                });
            }

            // Quotation Number filtering
            if (!empty($quotationNumber)) {
                $txQuery->whereHas('quotation', function ($q) use ($quotationNumber) {
                    $q->where('ref_no', 'like', "%{$quotationNumber}%");
                });
            }

            // Status filtering (on quotation payment master status)
            if ($status) {
                $txQuery->whereHas('quotationPayment', function ($q) use ($status) {
                    $q->where('status', $status);
                });
            }

            $transactions = $txQuery->orderBy('payment_date', 'desc')->orderBy('id', 'desc')->get();

            foreach ($transactions as $tx) {
                $quote = $tx->quotation;
                $master = $tx->quotationPayment;
                $quoteId = (int)($quote?->id ?: $tx->quotation_id);

                $quoteTotal = (float)($master?->total_amount ?: ($quote?->total_amount ?: 0));
                $distinctQuoteIds[$quoteId] = true;
                $totalQuotationAmountMap[$quoteId] = $quoteTotal;
                $totalPaidSum += (float)$tx->payment_amount;
                $totalTxCount++;

                $quoteDate = $quote?->quotation_date ?: ($quote?->created_at ? $quote->created_at->format('d/m/Y') : '-');
                $payDate = $tx->payment_date ? $tx->payment_date->format('d/m/Y') : ($tx->created_at ? $tx->created_at->format('d/m/Y') : '-');
                $payDateFormatted = $tx->payment_date ? $tx->payment_date->format('d M Y, h:i A') : ($tx->created_at ? $tx->created_at->format('d M Y, h:i A') : '-');

                // Derive status label at transaction time or current
                $curStatus = $master?->status ?: ($tx->balance_after <= 0 ? 'paid' : ($tx->total_paid_after > 0 ? 'partially_paid' : 'pending'));
                $statusLabel = match ($curStatus) {
                    'paid' => 'Paid',
                    'partially_paid' => 'Partially Paid',
                    default => 'Pending',
                };

                $records[] = [
                    'customer_id' => $quote?->client_phone ?: (string)$quoteId,
                    'customer_name' => $quote?->client_name ?: ($master?->client_name ?: 'Unnamed Customer'),
                    'customer_contact' => $quote?->client_phone ?: ($master?->client_phone ?: '-'),
                    'quotation_id' => $quoteId,
                    'quotation_number' => $quote?->ref_no ?: ($master?->ref_no ?: 'N/A'),
                    'quotation_date' => $quoteDate,
                    'quotation_total_amount' => $quoteTotal,
                    'payment_id' => (int)$tx->id,
                    'payment_date' => $payDate,
                    'payment_date_formatted' => $payDateFormatted,
                    'payment_amount' => (float)$tx->payment_amount,
                    'total_paid_after' => (float)$tx->total_paid_after,
                    'balance_after' => (float)$tx->balance_after,
                    'payment_status' => $statusLabel,
                    'payment_status_raw' => $curStatus,
                    'payment_method' => $tx->payment_method ?: 'Cash',
                    'transaction_reference' => $tx->transaction_reference ?: '-',
                    'notes' => $tx->notes ?: '',
                ];
            }
        }

        // 2. If status is 'pending' OR status is empty/'all' without narrow payment-date filter,
        // also include quotations that have 0 payments so the report is comprehensive.
        if ($status === 'pending' || (empty($status) && !$fromDate && !$toDate)) {
            $pendingQuery = QuotationPayment::with(['quotation'])
                ->whereHas('quotation', function ($q) {
                    $q->active();
                })
                ->where(function ($q) {
                    $q->where('status', 'pending')->orWhere('amount_paid', '<=', 0);
                });

            if (!empty($customer)) {
                $pendingQuery->where(function ($q) use ($customer) {
                    $q->where('client_name', 'like', "%{$customer}%")
                        ->orWhere('client_phone', 'like', "%{$customer}%");
                });
            }

            if (!empty($quotationNumber)) {
                $pendingQuery->where('ref_no', 'like', "%{$quotationNumber}%");
            }

            $pendingMasters = $pendingQuery->get();

            foreach ($pendingMasters as $master) {
                $quote = $master->quotation;
                $quoteId = (int)$master->quotation_id;
                $quoteTotal = (float)$master->total_amount;

                $distinctQuoteIds[$quoteId] = true;
                $totalQuotationAmountMap[$quoteId] = $quoteTotal;

                $quoteDate = $quote?->quotation_date ?: ($master->created_at ? $master->created_at->format('d/m/Y') : '-');

                $records[] = [
                    'customer_id' => $master->client_phone ?: (string)$quoteId,
                    'customer_name' => $master->client_name ?: 'Unnamed Customer',
                    'customer_contact' => $master->client_phone ?: '-',
                    'quotation_id' => $quoteId,
                    'quotation_number' => $master->ref_no ?: 'N/A',
                    'quotation_date' => $quoteDate,
                    'quotation_total_amount' => $quoteTotal,
                    'payment_id' => null,
                    'payment_date' => '-',
                    'payment_date_formatted' => 'No payment yet',
                    'payment_amount' => 0.0,
                    'total_paid_after' => 0.0,
                    'balance_after' => $quoteTotal,
                    'payment_status' => 'Pending',
                    'payment_status_raw' => 'pending',
                    'payment_method' => '-',
                    'transaction_reference' => '-',
                    'notes' => $master->notes ?: '',
                ];
            }
        }

        $totalQuotationAmountSum = array_sum($totalQuotationAmountMap);
        $totalBalanceSum = max(0.0, $totalQuotationAmountSum - $totalPaidSum);

        return response()->json([
            'success' => true,
            'report_type' => 'payment_history',
            'data' => $records,
            'summary' => [
                'totalQuotations' => count($distinctQuoteIds),
                'totalQuotationAmount' => round($totalQuotationAmountSum, 2),
                'totalAmountPaid' => round($totalPaidSum, 2),
                'totalAmountToPay' => round($totalBalanceSum, 2),
                'totalPaymentTransactions' => $totalTxCount,
            ],
            'filters' => [
                'fromDate' => $request->query('fromDate') ?: '',
                'toDate' => $request->query('toDate') ?: '',
                'customer' => $customer,
                'quotationNumber' => $quotationNumber,
                'status' => $status ?: 'all',
            ],
            'generated_at' => Carbon::now()->toIso8601String(),
            'generated_at_formatted' => Carbon::now()->format('d M Y, h:i A'),
        ]);
    }

    /**
     * Dedicated Quotation History Report API (Non-paginated).
     * Returns quotations matching supplied filters with payment summary and status.
     */
    public function quotationHistory(Request $request): JsonResponse
    {
        $this->ensureMastersSynced();

        $fromDate = $this->parseDate($request->query('fromDate') ?: $request->query('start_date'));
        $toDate = $this->parseDate($request->query('toDate') ?: $request->query('end_date'), true);
        $customer = trim((string)($request->query('customer') ?: $request->query('customerId') ?: ''));
        $quotationNumber = trim((string)($request->query('quotationNumber') ?: $request->query('ref_no') ?: ''));
        $paymentStatus = $this->normalizeStatus($request->query('status') ?: $request->query('paymentStatus'));
        $quotationStatus = trim((string)$request->query('quotationStatus', ''));

        $query = Quotation::active()->with(['payment']);

        // Date filter
        if ($fromDate) {
            $query->where('created_at', '>=', $fromDate);
        }
        if ($toDate) {
            $query->where('created_at', '<=', $toDate);
        }

        // Customer filter
        if (!empty($customer)) {
            $query->where(function ($q) use ($customer) {
                $q->where('client_name', 'like', "%{$customer}%")
                    ->orWhere('client_phone', 'like', "%{$customer}%")
                    ->orWhere('id', $customer);
            });
        }

        // Quotation Number filter
        if (!empty($quotationNumber)) {
            $query->where('ref_no', 'like', "%{$quotationNumber}%");
        }

        // Payment Status filter
        if ($paymentStatus) {
            $query->whereHas('payment', function ($q) use ($paymentStatus) {
                $q->where('status', $paymentStatus);
            });
        }

        // Quotation Status filter (if specified and not 'all')
        if (!empty($quotationStatus) && strtolower($quotationStatus) !== 'all') {
            $query->where('status', $quotationStatus);
        }

        $quotations = $query->orderBy('created_at', 'desc')->orderBy('id', 'desc')->get();

        $records = [];
        $totalQuotationAmount = 0.0;
        $totalAmountPaid = 0.0;
        $statusCounts = ['pending' => 0, 'partially_paid' => 0, 'paid' => 0];

        foreach ($quotations as $quote) {
            $payment = $quote->payment;
            $total = (float)($payment?->total_amount ?: QuotationPayment::parseAmount($quote->total_amount));
            $paid = (float)($payment?->amount_paid ?: 0);
            $balance = (float)($payment?->balance_amount ?: max(0.0, $total - $paid));
            $curStatus = $payment?->status ?: ($balance <= 0 && $total > 0 ? 'paid' : ($paid > 0 ? 'partially_paid' : 'pending'));

            $totalQuotationAmount += $total;
            $totalAmountPaid += $paid;
            if (isset($statusCounts[$curStatus])) {
                $statusCounts[$curStatus]++;
            }

            $statusLabel = match ($curStatus) {
                'paid' => 'Paid',
                'partially_paid' => 'Partially Paid',
                default => 'Pending',
            };

            $quoteDate = $quote->quotation_date ?: ($quote->created_at ? $quote->created_at->format('d/m/Y') : '-');

            $records[] = [
                'quotation_id' => (int)$quote->id,
                'quotation_number' => $quote->ref_no ?: 'N/A',
                'quotation_date' => $quoteDate,
                'quotation_date_formatted' => $quote->created_at ? $quote->created_at->format('d M Y') : $quoteDate,
                'customer_id' => $quote->client_phone ?: (string)$quote->id,
                'customer_name' => $quote->client_name ?: 'Unnamed Customer',
                'customer_contact' => $quote->client_phone ?: '-',
                'customer_address' => $quote->client_address ?: '-',
                'system_capacity' => $quote->capacity ?: '-',
                'system_type' => $quote->system_type ?: '-',
                'quotation_total_amount' => $total,
                'amount_paid' => $paid,
                'amount_to_pay' => $balance,
                'payment_status' => $statusLabel,
                'payment_status_raw' => $curStatus,
                'quotation_status' => $quote->status ? ucfirst($quote->status) : 'Active',
                'created_at_formatted' => $quote->created_at ? $quote->created_at->format('d M Y, h:i A') : '-',
            ];
        }

        $totalAmountToPay = max(0.0, $totalQuotationAmount - $totalAmountPaid);

        return response()->json([
            'success' => true,
            'report_type' => 'quotation_history',
            'data' => $records,
            'summary' => [
                'totalQuotations' => count($records),
                'totalQuotationAmount' => round($totalQuotationAmount, 2),
                'totalAmountPaid' => round($totalAmountPaid, 2),
                'totalAmountToPay' => round($totalAmountToPay, 2),
                'statusCounts' => $statusCounts,
            ],
            'filters' => [
                'fromDate' => $request->query('fromDate') ?: '',
                'toDate' => $request->query('toDate') ?: '',
                'customer' => $customer,
                'quotationNumber' => $quotationNumber,
                'status' => $paymentStatus ?: 'all',
                'quotationStatus' => $quotationStatus ?: 'all',
            ],
            'generated_at' => Carbon::now()->toIso8601String(),
            'generated_at_formatted' => Carbon::now()->format('d M Y, h:i A'),
        ]);
    }

    /**
     * Dedicated Client Payment History Report API (Non-paginated).
     * Returns Customer -> Quotations -> Payments hierarchy for a specific customer.
     */
    public function clientPaymentHistory(Request $request): JsonResponse
    {
        $this->ensureMastersSynced();

        $customerId = trim((string)($request->query('customerId') ?: $request->query('customer') ?: ''));
        $fromDate = $this->parseDate($request->query('fromDate') ?: $request->query('start_date'));
        $toDate = $this->parseDate($request->query('toDate') ?: $request->query('end_date'), true);

        if (empty($customerId)) {
            // If no customer requested, return empty structure with instruction
            return response()->json([
                'success' => true,
                'report_type' => 'client_payment_history',
                'data' => null,
                'summary' => [
                    'totalQuotations' => 0,
                    'totalQuotationAmount' => 0.0,
                    'totalAmountPaid' => 0.0,
                    'totalAmountToPay' => 0.0,
                    'totalPaymentTransactions' => 0,
                ],
                'message' => 'Please select a customer to view their complete payment history.',
            ]);
        }

        // Query quotations for this client (by phone, ID, or client name)
        $quoteQuery = Quotation::active()
            ->with(['payment', 'paymentHistories' => function ($q) use ($fromDate, $toDate) {
                if ($fromDate) {
                    $q->where('payment_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $q->where('payment_date', '<=', $toDate);
                }
                $q->orderBy('payment_date', 'asc')->orderBy('id', 'asc');
            }])
            ->where(function ($q) use ($customerId) {
                $q->where('client_phone', $customerId)
                    ->orWhere('client_name', 'like', "%{$customerId}%")
                    ->orWhere('id', $customerId);
            });

        $quotations = $quoteQuery->orderBy('created_at', 'desc')->get();

        if ($quotations->isEmpty()) {
            return response()->json([
                'success' => true,
                'report_type' => 'client_payment_history',
                'data' => [
                    'customer' => [
                        'id' => $customerId,
                        'name' => $customerId,
                        'phone' => '-',
                        'address' => '-',
                    ],
                    'quotations' => [],
                ],
                'summary' => [
                    'totalQuotations' => 0,
                    'totalQuotationAmount' => 0.0,
                    'totalAmountPaid' => 0.0,
                    'totalAmountToPay' => 0.0,
                    'totalPaymentTransactions' => 0,
                ],
                'message' => 'No quotations found for this customer.',
            ]);
        }

        $firstQuote = $quotations->first();
        $customerInfo = [
            'id' => $firstQuote->client_phone ?: (string)$firstQuote->id,
            'name' => $firstQuote->client_name ?: 'Unnamed Customer',
            'phone' => $firstQuote->client_phone ?: '-',
            'address' => $firstQuote->client_address ?: '-',
        ];

        $quotationList = [];
        $totalQuotationAmount = 0.0;
        $totalAmountPaid = 0.0;
        $totalTxCount = 0;

        foreach ($quotations as $quote) {
            $payment = $quote->payment;
            $total = (float)($payment?->total_amount ?: QuotationPayment::parseAmount($quote->total_amount));
            $paid = (float)($payment?->amount_paid ?: 0);
            $balance = (float)($payment?->balance_amount ?: max(0.0, $total - $paid));
            $status = $payment?->status ?: ($balance <= 0 && $total > 0 ? 'paid' : ($paid > 0 ? 'partially_paid' : 'pending'));

            $totalQuotationAmount += $total;
            $totalAmountPaid += $paid;

            $statusLabel = match ($status) {
                'paid' => 'Paid',
                'partially_paid' => 'Partially Paid',
                default => 'Pending',
            };

            $paymentsList = [];
            foreach ($quote->paymentHistories as $tx) {
                $totalTxCount++;
                $paymentsList[] = [
                    'payment_id' => (int)$tx->id,
                    'payment_date' => $tx->payment_date ? $tx->payment_date->format('d/m/Y') : ($tx->created_at ? $tx->created_at->format('d/m/Y') : '-'),
                    'payment_date_formatted' => $tx->payment_date ? $tx->payment_date->format('d M Y, h:i A') : ($tx->created_at ? $tx->created_at->format('d M Y, h:i A') : '-'),
                    'payment_amount' => (float)$tx->payment_amount,
                    'total_paid_after' => (float)$tx->total_paid_after,
                    'balance_after' => (float)$tx->balance_after,
                    'payment_method' => $tx->payment_method ?: 'Cash',
                    'transaction_reference' => $tx->transaction_reference ?: '-',
                    'notes' => $tx->notes ?: '',
                ];
            }

            $quoteDate = $quote->quotation_date ?: ($quote->created_at ? $quote->created_at->format('d/m/Y') : '-');

            $quotationList[] = [
                'quotation_id' => (int)$quote->id,
                'quotation_number' => $quote->ref_no ?: 'N/A',
                'quotation_date' => $quoteDate,
                'quotation_date_formatted' => $quote->created_at ? $quote->created_at->format('d M Y') : $quoteDate,
                'system_capacity' => $quote->capacity ?: '-',
                'system_type' => $quote->system_type ?: '-',
                'total_amount' => $total,
                'amount_paid' => $paid,
                'balance_amount' => $balance,
                'payment_status' => $statusLabel,
                'payment_status_raw' => $status,
                'remarks' => $payment?->notes ?: '',
                'payments' => $paymentsList,
            ];
        }

        $totalAmountToPay = max(0.0, $totalQuotationAmount - $totalAmountPaid);

        return response()->json([
            'success' => true,
            'report_type' => 'client_payment_history',
            'data' => [
                'customer' => $customerInfo,
                'quotations' => $quotationList,
            ],
            'summary' => [
                'totalQuotations' => count($quotationList),
                'totalQuotationAmount' => round($totalQuotationAmount, 2),
                'totalAmountPaid' => round($totalAmountPaid, 2),
                'totalAmountToPay' => round($totalAmountToPay, 2),
                'totalPaymentTransactions' => $totalTxCount,
            ],
            'filters' => [
                'customerId' => $customerId,
                'fromDate' => $request->query('fromDate') ?: '',
                'toDate' => $request->query('toDate') ?: '',
            ],
            'generated_at' => Carbon::now()->toIso8601String(),
            'generated_at_formatted' => Carbon::now()->format('d M Y, h:i A'),
        ]);
    }

    /**
     * Helper API: Return unique list of customers for dropdown selection.
     */
    public function clientsList(): JsonResponse
    {
        $quotes = Quotation::active()
            ->select('id', 'client_name', 'client_phone', 'client_address')
            ->orderBy('client_name', 'asc')
            ->get();

        $clients = [];
        $seen = [];

        foreach ($quotes as $q) {
            $name = trim((string)$q->client_name);
            $phone = trim((string)$q->client_phone);
            if (empty($name)) continue;

            $key = strtolower($name) . '|' . $phone;
            if (isset($seen[$key])) {
                $clients[$seen[$key]]['total_quotations']++;
                continue;
            }

            $id = (string)$q->id;
            $seen[$key] = count($clients);
            $clients[] = [
                'id' => $id,
                'name' => $name,
                'phone' => $phone ?: '-',
                'address' => $q->client_address ?: '-',
                'total_quotations' => 1,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }
}

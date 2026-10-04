<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
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
     * List all saved quotations with date filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = trim((string)$request->query('search', ''));
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            $query = Quotation::active();

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
                    'created_by' => $item->created_by ?: 'admin',
                    'created_at' => $item->created_at?->toISOString(),
                    'created_at_formatted' => $item->created_at?->format('d M Y, h:i A'),
                    'created_at_date' => $item->created_at?->format('Y-m-d'),
                    'created_at_human' => $item->created_at?->diffForHumans(),
                ];
            });

            // Summary stats
            $allActive = Quotation::active();
            $totalCount = (clone $allActive)->count();
            $todayCount = (clone $allActive)->whereDate('created_at', Carbon::today())->count();
            $thisMonthCount = (clone $allActive)->where('created_at', '>=', Carbon::now()->startOfMonth())->count();

            return response()->json([
                'success' => true,
                'data' => $quotations,
                'stats' => [
                    'total' => $totalCount,
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
     * Store a newly created quotation with its main data and generated PDF.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $clientName = trim((string)$request->input('client_name', ''));
            if (empty($clientName)) {
                $clientName = 'Client ' . date('d-m-Y');
            }

            $refNo = trim((string)$request->input('ref_no', ''));
            $clientPhone = trim((string)$request->input('client_phone', ''));
            $clientAddress = trim((string)$request->input('client_address', ''));
            $capacity = trim((string)$request->input('capacity', ''));
            $systemType = trim((string)$request->input('system_type', ''));
            $totalAmount = trim((string)$request->input('total_amount', ''));
            $quotationDate = trim((string)$request->input('quotation_date', date('d/m/Y')));

            $adminUser = $request->hasSession() ? $request->session()->get('admin_username', 'admin') : 'admin';

            // Ensure destination directory exists
            $uploadDir = public_path('uploads/quotations');
            if (!File::isDirectory($uploadDir)) {
                File::makeDirectory($uploadDir, 0755, true, true);
            }

            $pdfPath = null;
            $pdfUrl = null;

            // Handle direct file upload or base64 data
            if ($request->hasFile('pdf_file')) {
                $file = $request->file('pdf_file');
                $filename = 'quote_' . Str::slug($clientName ?: 'quote') . '_' . time() . '.pdf';
                $file->move($uploadDir, $filename);
                $pdfPath = 'uploads/quotations/' . $filename;
                $pdfUrl = '/uploads/quotations/' . $filename;
            } elseif ($request->filled('pdf_base64')) {
                $base64 = $request->input('pdf_base64');
                // Strip possible data:application/pdf;base64, prefix
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

            $quotation = Quotation::create([
                'ref_no' => $refNo ?: 'N/A',
                'client_name' => $clientName,
                'client_phone' => $clientPhone,
                'client_address' => $clientAddress,
                'capacity' => $capacity,
                'system_type' => $systemType,
                'total_amount' => $totalAmount,
                'quotation_date' => $quotationDate,
                'pdf_path' => $pdfPath,
                'pdf_url' => $pdfUrl,
                'status' => 'active',
                'created_by' => $adminUser,
            ]);

            // Sync master payment tracking record
            try {
                QuotationPayment::syncForQuotation($quotation);
            } catch (\Throwable $e) {
                // Non-blocking for quotation generation
            }

            return response()->json([
                'success' => true,
                'message' => "Quotation for '{$clientName}' saved successfully to history.",
                'data' => [
                    'id' => (int)$quotation->id,
                    'ref_no' => $quotation->ref_no,
                    'client_name' => $quotation->client_name,
                    'pdf_url' => $quotation->pdf_url ? url($quotation->pdf_url) : null,
                    'created_at_formatted' => $quotation->created_at?->format('d M Y, h:i A'),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save quotation to history.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single quotation by ID.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $quotation = Quotation::findOrFail($id);

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
                    'pdf_url' => $quotation->pdf_url ? url($quotation->pdf_url) : null,
                    'status' => $quotation->status,
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
                // Optionally remove the PDF file if exists
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

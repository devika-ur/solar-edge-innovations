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

class AgreementController extends Controller
{
    /**
     * Store or update an agreement for an approved quotation.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $quotationId = (int)$request->input('quotation_id');
            if (!$quotationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quotation ID is required to generate an agreement.',
                ], 422);
            }

            $quotation = Quotation::findOrFail($quotationId);

            // Validation: Only approved quotations or those already having agreements are eligible
            if (!in_array($quotation->workflow_status, ['approved', 'agreement_created', 'completed'])) {
                return response()->json([
                    'success' => false,
                    'message' => "Quotation #{$quotation->ref_no} must be marked as 'Approved by Client' before generating an agreement.",
                ], 422);
            }

            $consumerName = trim((string)$request->input('consumer_name', '')) ?: $quotation->client_name;
            $consumerAddress = trim((string)$request->input('consumer_address', '')) ?: $quotation->client_address;
            $agreementDate = trim((string)$request->input('agreement_date', ''));

            // Decode agreement data if passed as JSON string
            $agreementDataRaw = $request->input('agreement_data');
            $agreementData = is_string($agreementDataRaw) ? json_decode($agreementDataRaw, true) : (is_array($agreementDataRaw) ? $agreementDataRaw : []);

            $adminUser = $request->hasSession() ? $request->session()->get('admin_username', 'admin') : 'admin';

            // Destination directory for agreements
            $uploadDir = public_path('uploads/agreements');
            if (!File::isDirectory($uploadDir)) {
                File::makeDirectory($uploadDir, 0755, true, true);
            }

            $pdfPath = null;
            $pdfUrl = null;

            // Handle direct file upload or base64 data
            if ($request->hasFile('pdf_file')) {
                $file = $request->file('pdf_file');
                $filename = 'agreement_' . Str::slug($consumerName ?: 'agreement') . '_' . time() . '.pdf';
                $file->move($uploadDir, $filename);
                $pdfPath = 'uploads/agreements/' . $filename;
                $pdfUrl = '/uploads/agreements/' . $filename;
            } elseif ($request->filled('pdf_base64')) {
                $base64 = $request->input('pdf_base64');
                if (str_contains($base64, ',')) {
                    $base64 = explode(',', $base64)[1];
                }
                $decoded = base64_decode($base64);
                if ($decoded !== false) {
                    $cleanName = Str::slug($consumerName ?: 'consumer');
                    $filename = "agreement_{$cleanName}_{$quotation->id}_" . time() . ".pdf";
                    File::put($uploadDir . '/' . $filename, $decoded);
                    $pdfPath = 'uploads/agreements/' . $filename;
                    $pdfUrl = '/uploads/agreements/' . $filename;
                }
            }

            // Find existing or create new agreement
            $agreement = Agreement::firstOrNew(['quotation_id' => $quotation->id]);
            $agreement->consumer_name = $consumerName;
            $agreement->consumer_address = $consumerAddress;
            $agreement->agreement_date = $agreementDate ?: date('d/m/Y');
            $agreement->agreement_data = $agreementData;
            if ($pdfPath) {
                $agreement->pdf_path = $pdfPath;
                $agreement->pdf_url = $pdfUrl;
            }
            $agreement->status = 'saved';
            $agreement->created_by = $adminUser;
            $agreement->save();

            // Update Quotation workflow status
            if ($quotation->workflow_status !== 'completed') {
                $quotation->workflow_status = 'agreement_created';
            }
            if (!$quotation->agreement_created_at) {
                $quotation->agreement_created_at = Carbon::now();
            }
            $quotation->save();

            // Sync master payment tracking record so it appears on the Payments page
            try {
                QuotationPayment::syncForQuotation($quotation);
            } catch (\Throwable $e) {
                // Non-blocking
            }

            return response()->json([
                'success' => true,
                'message' => "Agreement for '{$consumerName}' saved successfully. Application status updated to 'Agreement Created'.",
                'data' => [
                    'agreement_id' => $agreement->id,
                    'quotation_id' => $quotation->id,
                    'consumer_name' => $agreement->consumer_name,
                    'pdf_url' => $agreement->pdf_url ? url($agreement->pdf_url) : null,
                    'workflow_status' => $quotation->workflow_status,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save agreement.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get agreement details for a quotation.
     */
    public function show(Request $request, ?int $quotationId = null): JsonResponse
    {
        try {
            $quoteId = $quotationId ?: (int)$request->query('quotation_id') ?: (int)$request->query('id') ?: (int)$request->input('quotation_id');
            $quotation = Quotation::findOrFail($quoteId);
            $agreement = Agreement::where('quotation_id', $quotation->id)->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'has_agreement' => !empty($agreement),
                    'agreement' => $agreement ? [
                        'id' => $agreement->id,
                        'consumer_name' => $agreement->consumer_name,
                        'consumer_address' => $agreement->consumer_address,
                        'agreement_date' => $agreement->agreement_date,
                        'agreement_data' => $agreement->agreement_data,
                        'pdf_url' => $agreement->pdf_url ? url($agreement->pdf_url) : null,
                        'created_at_formatted' => $agreement->created_at?->format('d M Y, h:i A'),
                    ] : null,
                    'quotation' => [
                        'id' => $quotation->id,
                        'ref_no' => $quotation->ref_no,
                        'client_name' => $quotation->client_name,
                        'client_phone' => $quotation->client_phone,
                        'client_address' => $quotation->client_address,
                        'capacity' => $quotation->capacity,
                        'system_type' => $quotation->system_type,
                        'total_amount' => $quotation->total_amount,
                        'quotation_date' => $quotation->quotation_date,
                        'workflow_status' => $quotation->workflow_status ?: 'approval_pending',
                        'quotation_data' => $quotation->quotation_data,
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Agreement not found.',
                'error' => $e->getMessage(),
            ], 404);
        }
    }
}

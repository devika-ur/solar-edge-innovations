<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FaqRequest;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * List all FAQs for admin management.
     */
    public function index(): JsonResponse
    {
        try {
            $faqs = Faq::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($f) {
                return [
                    'id' => (int)$f->id,
                    'question' => $f->question,
                    'answer' => $f->answer,
                    'category' => $f->category,
                    'display_order' => (int)$f->sort_order,
                    'is_active' => $f->status === 'published',
                    'status' => $f->status,
                    'created_at' => $f->created_at?->toISOString() ?? null,
                    'updated_at' => $f->updated_at?->toISOString() ?? null,
                ];
            });

            return response()->json([
                'success' => true,
                'count' => count($faqs),
                'data' => $faqs,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve FAQs.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle FAQ operations (create, update, toggle_status, delete, restore).
     */
    public function handle(FaqRequest $request): JsonResponse
    {
        $action = $request->input('action', 'create');

        try {
            if ($action === 'create') {
                $status = $request->boolean('is_active', true) ? 'published' : 'draft';

                $faq = Faq::create([
                    'question' => trim($request->input('question')),
                    'answer' => trim($request->input('answer')),
                    'category' => trim($request->input('category', 'General')),
                    'sort_order' => (int)$request->input('display_order', 0),
                    'status' => $status,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'FAQ created successfully.',
                    'id' => $faq->id,
                ]);
            }

            if ($action === 'update') {
                $id = (int)$request->input('id');
                $faq = Faq::findOrFail($id);

                $status = $request->boolean('is_active', true) ? 'published' : 'draft';

                $faq->update([
                    'question' => trim($request->input('question')),
                    'answer' => trim($request->input('answer')),
                    'category' => trim($request->input('category', 'General')),
                    'sort_order' => (int)$request->input('display_order', 0),
                    'status' => $status,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'FAQ updated successfully.',
                ]);
            }

            if ($action === 'toggle_status') {
                $id = (int)$request->input('id');
                $faq = Faq::findOrFail($id);

                $status = $request->boolean('is_active') ? 'published' : 'draft';
                $faq->update(['status' => $status]);

                return response()->json([
                    'success' => true,
                    'message' => 'FAQ status updated.',
                ]);
            }

            if ($action === 'delete') {
                $id = (int)$request->input('id');
                $faq = Faq::findOrFail($id);
                $faq->update(['status' => 'deleted']);
                $faq->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'FAQ deleted successfully.',
                ]);
            }

            if ($action === 'restore') {
                $id = (int)$request->input('id');
                $faq = Faq::withTrashed()->findOrFail($id);
                $faq->restore();
                $faq->update(['status' => 'published']);

                return response()->json([
                    'success' => true,
                    'message' => 'FAQ restored successfully.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Unsupported action.',
            ], 400);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Operation failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

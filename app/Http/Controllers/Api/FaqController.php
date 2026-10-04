<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * Display a listing of published FAQs.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Faq::query()->where('status', 'published');

            if ($request->filled('category')) {
                $query->where('category', trim($request->input('category')));
            }

            $faqs = $query->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get(['id', 'question', 'answer', 'category', 'sort_order'])
                ->map(function ($faq) {
                    return [
                        'id' => (int)$faq->id,
                        'question' => $faq->question,
                        'answer' => $faq->answer,
                        'category' => $faq->category ?? 'General',
                        'sort_order' => (int)$faq->sort_order,
                    ];
                });

            return response()->json([
                'success' => true,
                'faqs' => $faqs,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch FAQs.',
                'error' => $e->getMessage(),
                'faqs' => [],
            ], 500);
        }
    }
}

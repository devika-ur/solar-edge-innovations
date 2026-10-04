<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Display a listing of published projects with gallery images.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Project::query()
                ->where('status', 'published')
                ->with(['images' => function ($q) {
                    $q->where('status', 'active')
                      ->orderBy('sort_order', 'asc')
                      ->orderBy('id', 'asc');
                }]);

            if ($request->filled('category')) {
                $query->where('category', trim($request->input('category')));
            }

            if ($request->filled('id') && (int)$request->input('id') > 0) {
                $query->where('id', (int)$request->input('id'));
            }

            $projects = $query->orderBy('id', 'desc')->get()->map(function ($project) {
                $images = $project->images->pluck('image_path')->filter()->values()->all();
                $coverImage = $project->image ?? '';

                if (!empty($coverImage) && !in_array($coverImage, $images, true)) {
                    array_unshift($images, $coverImage);
                }

                if (empty($coverImage) && !empty($images)) {
                    $coverImage = $images[0];
                }

                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description ?? '',
                    'location' => $project->location ?? '',
                    'category' => $project->category ?? 'Solar Installation',
                    'cover_image' => $coverImage,
                    'images' => $images,
                    'created_at' => $project->created_at?->toISOString() ?? null,
                ];
            });

            return response()->json([
                'success' => true,
                'projects' => $projects,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch projects.',
                'error' => $e->getMessage(),
                'projects' => [],
            ], 500);
        }
    }
}

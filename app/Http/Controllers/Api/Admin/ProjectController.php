<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProjectRequest;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    protected ImageUploadService $uploadService;

    public function __construct(ImageUploadService $uploadService)
    {
        $this->uploadService = $uploadService;
    }

    /**
     * List all projects and their photos for the admin panel.
     */
    public function index(): JsonResponse
    {
        try {
            $projects = Project::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })
            ->with(['images' => function ($q) {
                $q->where(function ($sq) {
                    $sq->whereNull('status')->orWhere('status', '!=', 'deleted');
                })->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
            }])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($p) {
                $images = $p->images->map(function ($img) {
                    return [
                        'id' => (int)$img->id,
                        'url' => $img->image_path,
                        'alt' => $img->image_alt ?? '',
                        'sort_order' => (int)$img->sort_order,
                    ];
                });

                return [
                    'id' => (int)$p->id,
                    'title' => $p->title,
                    'description' => $p->description ?? '',
                    'location' => $p->location ?? '',
                    'category' => $p->category ?? 'Rooftop Solar',
                    'cover_image' => $p->image ?? '',
                    'status' => $p->status,
                    'images' => $images,
                    'created_at' => $p->created_at?->toISOString() ?? null,
                    'updated_at' => $p->updated_at?->toISOString() ?? null,
                ];
            });

            return response()->json([
                'success' => true,
                'projects' => $projects,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching projects: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle admin actions (toggle_status, delete_image, delete_project, restore_project, create/update).
     */
    public function handle(ProjectRequest $request): JsonResponse
    {
        $action = $request->input('action', '');

        try {
            // 1. Toggle Status
            if ($action === 'toggle_status') {
                $projectId = (int)$request->input('project_id');
                $status = $request->input('status') === 'published' ? 'published' : 'draft';

                Project::where('id', $projectId)->update(['status' => $status]);

                return response()->json([
                    'success' => true,
                    'message' => "Project status updated to {$status}.",
                    'status' => $status,
                ]);
            }

            // 2. Delete Single Image
            if ($action === 'delete_image') {
                $imageId = (int)$request->input('image_id');
                $image = ProjectImage::find($imageId);

                if ($image) {
                    $image->update(['status' => 'deleted']);
                    $image->delete();

                    return response()->json([
                        'success' => true,
                        'message' => 'Image removed successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Image not found.',
                ], 404);
            }

            // 3. Delete Entire Project
            if ($action === 'delete_project') {
                $projectId = (int)$request->input('project_id');
                $project = Project::find($projectId);

                if ($project) {
                    $project->update(['status' => 'deleted']);
                    $project->images()->update(['status' => 'deleted']);
                    $project->images()->delete();
                    $project->delete();

                    return response()->json([
                        'success' => true,
                        'message' => 'Project and associated photos deleted successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Project not found.',
                ], 404);
            }

            // 4. Restore Soft-Deleted Project
            if ($action === 'restore_project') {
                $projectId = (int)$request->input('project_id');
                $project = Project::withTrashed()->find($projectId);

                if ($project) {
                    $project->restore();
                    $project->update(['status' => 'published']);
                    ProjectImage::withTrashed()->where('project_id', $projectId)->restore();
                    ProjectImage::where('project_id', $projectId)->update(['status' => 'active']);

                    return response()->json([
                        'success' => true,
                        'message' => 'Project restored successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Project not found.',
                ], 404);
            }

            // 5. Create or Update Project
            $title = trim($request->input('title', ''));
            $description = trim($request->input('description', ''));
            $location = trim($request->input('location', ''));
            $category = trim($request->input('category', 'solar'));
            $status = in_array($request->input('status'), ['published', 'draft']) ? $request->input('status') : 'published';
            $projectId = $request->filled('project_id') && (int)$request->input('project_id') > 0 ? (int)$request->input('project_id') : null;

            if (empty($title)) {
                $catLabel = !empty($category) ? ucfirst($category) : 'Solar';
                $title = $catLabel . (!empty($location) ? ' - ' . $location : ' Installation');
            }

            // Handle Cover Image
            $coverPath = null;
            if ($request->hasFile('cover_image')) {
                $uploadRes = $this->uploadService->upload($request->file('cover_image'));
                if ($uploadRes['success']) {
                    $coverPath = $uploadRes['path'];
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cover image error: ' . $uploadRes['error'],
                    ], 400);
                }
            }

            if ($projectId) {
                $project = Project::findOrFail($projectId);
                $updateData = [
                    'title' => $title,
                    'description' => $description,
                    'location' => $location,
                    'category' => $category,
                    'status' => $status,
                ];
                if ($coverPath) {
                    $updateData['image'] = $coverPath;
                }
                $project->update($updateData);
            } else {
                $project = Project::create([
                    'title' => $title,
                    'description' => $description,
                    'location' => $location,
                    'category' => $category,
                    'image' => $coverPath ?? '',
                    'status' => $status,
                ]);
                $projectId = $project->id;
            }

            // Handle Multiple Gallery Images
            $uploadedCount = 0;
            if ($request->hasFile('gallery_images')) {
                $galleryFiles = $request->file('gallery_images');
                if (!is_array($galleryFiles)) {
                    $galleryFiles = [$galleryFiles];
                }

                $maxOrder = (int)ProjectImage::where('project_id', $projectId)->max('sort_order') ?: 0;

                foreach ($galleryFiles as $file) {
                    if (!$file) continue;

                    $res = $this->uploadService->upload($file);
                    if ($res['success']) {
                        $maxOrder++;
                        ProjectImage::create([
                            'project_id' => $projectId,
                            'image_path' => $res['path'],
                            'image_alt' => $title,
                            'sort_order' => $maxOrder,
                            'status' => 'active',
                        ]);
                        $uploadedCount++;

                        // If cover is empty, assign first gallery photo
                        if (empty($project->image)) {
                            $project->update(['image' => $res['path']]);
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Project saved successfully with ' . $uploadedCount . ' new photos.',
                'project_id' => $projectId,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage(),
            ], 500);
        }
    }
}

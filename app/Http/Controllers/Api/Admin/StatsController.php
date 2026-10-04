<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AdminToken;
use App\Models\ContactInquiry;
use App\Models\Faq;
use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class StatsController extends Controller
{
    /**
     * Get dashboard overview statistics.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $totalProjects = Project::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })->count();

            $activeProjects = Project::where('status', 'published')->count();

            $totalImages = ProjectImage::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })->count();

            $totalFaqs = Faq::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })->count();

            $activeFaqs = Faq::where('status', 'published')->count();

            $activeTokens = AdminToken::where('expires_at', '>', now())
                ->where(function ($q) {
                    $q->whereNull('status')->orWhere('status', '!=', 'deleted');
                })->count();

            // Contact Inquiries metrics
            $totalInquiries = ContactInquiry::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })->count();

            $pendingInquiries = ContactInquiry::where('status', 'pending')->count();
            $respondedInquiries = ContactInquiry::where('status', 'responded')->count();

            $recentProjects = Project::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => (int)$p->id,
                    'title' => $p->title,
                    'category' => $p->category,
                    'cover_image' => $p->image,
                    'is_active' => $p->status === 'published' ? 1 : 0,
                    'created_at' => $p->created_at?->toISOString() ?? null,
                ];
            });

            $recentInquiries = ContactInquiry::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })
            ->orderBy('id', 'desc')
            ->limit(5)
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
                    'status' => $item->status,
                    'is_responded' => $item->status === 'responded',
                    'created_at' => $item->created_at?->toISOString() ?? null,
                    'created_at_human' => $item->created_at?->diffForHumans() ?? null,
                ];
            });

            $driverName = DB::connection()->getDriverName();
            $uploadDir = public_path('uploads/projects');
            $isWritable = is_writable($uploadDir) || (!File::isDirectory($uploadDir) && is_writable(public_path()));

            $adminUsername = $request->hasSession() ? $request->session()->get('admin_username', 'admin') : 'admin';

            return response()->json([
                'success' => true,
                'stats' => [
                    'total_projects' => $totalProjects,
                    'active_projects' => $activeProjects,
                    'total_images' => $totalImages,
                    'total_faqs' => $totalFaqs,
                    'active_faqs' => $activeFaqs,
                    'active_tokens' => $activeTokens,
                    'total_inquiries' => $totalInquiries,
                    'pending_inquiries' => $pendingInquiries,
                    'responded_inquiries' => $respondedInquiries,
                    'driver' => $driverName,
                    'upload_dir_writable' => $isWritable,
                    'admin_user' => $adminUsername,
                ],
                'recent_projects' => $recentProjects,
                'recent_inquiries' => $recentInquiries,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error querying stats.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

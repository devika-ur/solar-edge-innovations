<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AdminToken;
use App\Models\ContactInquiry;
use App\Models\Faq;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\Quotation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

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

            // Quotations metrics
            $totalQuotations = Quotation::active()->count();
            $recentQuotations = Quotation::active()
                ->orderBy('id', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($q) {
                    return [
                        'id' => (int)$q->id,
                        'ref_no' => $q->ref_no,
                        'client_name' => $q->client_name,
                        'capacity' => $q->capacity,
                        'total_amount' => $q->total_amount,
                        'created_at_formatted' => $q->created_at?->format('d M Y, h:i A'),
                    ];
                });

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

            // Monthly trends (Rolling last 6 months) - 100% Real Database Queries
            $months = [];
            for ($i = 5; $i >= 0; $i--) {
                $carbonDate = now()->subMonths($i);
                $key = $carbonDate->format('Y-m');
                $months[$key] = [
                    'key' => $key,
                    'month' => $carbonDate->format('M'),
                    'year' => (int)$carbonDate->format('Y'),
                    'label' => $carbonDate->format('M'),
                    'full_label' => $carbonDate->format('M Y'),
                    'count' => 0,
                    'responded' => 0,
                    'pending' => 0,
                    'quotations' => 0,
                    'total_amount' => 0,
                ];
            }

            $firstMonth = reset($months);
            $lastMonth = end($months);
            $startDate = \Illuminate\Support\Carbon::parse($firstMonth['key'] . '-01')->startOfMonth();
            $endDate = \Illuminate\Support\Carbon::parse($lastMonth['key'] . '-01')->endOfMonth();

            // Real Inquiries by month
            $inquiriesRecent = ContactInquiry::where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'deleted');
            })->whereBetween('created_at', [$startDate, $endDate])->get();

            foreach ($inquiriesRecent as $inq) {
                $k = $inq->created_at?->format('Y-m');
                if (isset($months[$k])) {
                    $months[$k]['count']++;
                    if ($inq->status === 'responded') {
                        $months[$k]['responded']++;
                    } else {
                        $months[$k]['pending']++;
                    }
                }
            }

            // Real Quotations by month
            if (Schema::hasTable('quotations')) {
                try {
                    $quotesRecent = Quotation::active()->whereBetween('created_at', [$startDate, $endDate])->get();
                    foreach ($quotesRecent as $qt) {
                        $k = $qt->created_at?->format('Y-m');
                        if (isset($months[$k])) {
                            $months[$k]['quotations']++;
                            $amountVal = (float)preg_replace('/[^0-9.]/', '', (string)($qt->total_amount ?? '0'));
                            $months[$k]['total_amount'] += $amountVal;
                        }
                    }
                } catch (\Throwable $e) {}
            }

            $monthlyInquiries = [];
            $monthlyQuotations = [];
            foreach ($months as $k => $m) {
                $monthlyInquiries[] = [
                    'key' => $m['key'],
                    'month' => $m['month'],
                    'year' => $m['year'],
                    'label' => $m['label'],
                    'full_label' => $m['full_label'],
                    'count' => $m['count'],
                    'responded' => $m['responded'],
                    'pending' => $m['pending'],
                ];

                $monthlyQuotations[] = [
                    'key' => $m['key'],
                    'month' => $m['month'],
                    'year' => $m['year'],
                    'label' => $m['label'],
                    'full_label' => $m['full_label'],
                    'count' => $m['quotations'],
                    'total_amount' => $m['total_amount'],
                ];
            }

            // Quotation composition by solar system type (Real Data)
            $quotationDistribution = [];
            if (Schema::hasTable('quotations')) {
                try {
                    $systemTypesCount = Quotation::active()
                        ->whereNotNull('system_type')
                        ->where('system_type', '!=', '')
                        ->select('system_type', DB::raw('count(*) as count'))
                        ->groupBy('system_type')
                        ->pluck('count', 'system_type')
                        ->toArray();

                    if (!empty($systemTypesCount)) {
                        $totalTypes = array_sum($systemTypesCount);
                        $palette = ['#1A4D2E', '#2E7D32', '#10B981', '#38BDF8', '#F59E0B', '#8B5CF6'];
                        $idx = 0;
                        foreach ($systemTypesCount as $type => $cnt) {
                            $quotationDistribution[] = [
                                'name' => (string)$type,
                                'share' => round(($cnt / $totalTypes) * 100),
                                'color' => $palette[$idx % count($palette)],
                                'count' => $cnt,
                            ];
                            $idx++;
                        }
                    }
                } catch (\Throwable $e) {}
            }

            if (empty($quotationDistribution)) {
                $quotationDistribution = [
                    ['name' => 'Solar Quotations', 'share' => 100, 'color' => '#1A4D2E', 'count' => $totalQuotations],
                ];
            }

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
                    'total_quotations' => $totalQuotations,
                    'driver' => $driverName,
                    'upload_dir_writable' => $isWritable,
                    'admin_user' => $adminUsername,
                    'monthly_inquiries' => $monthlyInquiries,
                    'monthly_quotations' => $monthlyQuotations,
                    'quotation_distribution' => $quotationDistribution,
                ],
                'recent_projects' => $recentProjects,
                'recent_inquiries' => $recentInquiries,
                'recent_quotations' => $recentQuotations,
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

<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Post;
use App\Models\Skill;
use App\Models\Message;
use App\Models\CvFile;
use App\Models\PageView;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics (Admin).
     */
    public function stats()
    {
        $projectsCount = Project::count();
        $postsCount = Post::count();
        $skillsCount = Skill::count();
        $messagesCount = Message::count();
        $unreadMessagesCount = Message::where('is_read', false)->count();
        $cvDownloads = CvFile::sum('download_count');

        $todayVisits = PageView::whereDate('created_at', Carbon::today())->count();
        $weekVisits = PageView::where('created_at', '>=', Carbon::now()->subDays(7))->count();
        $monthVisits = PageView::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        $totalVisits = PageView::count();

        return response()->json([
            'success' => true,
            'data' => [
                'projects_count' => $projectsCount,
                'posts_count' => $postsCount,
                'skills_count' => $skillsCount,
                'messages_count' => $messagesCount,
                'unread_messages_count' => $unreadMessagesCount,
                'cv_downloads' => $cvDownloads,
                'today_visits' => $todayVisits,
                'week_visits' => $weekVisits,
                'month_visits' => $monthVisits,
                'total_visits' => $totalVisits,
            ]
        ]);
    }

    /**
     * Get visits data for charts (Admin).
     */
    public function visits(Request $request)
    {
        $period = $request->input('period', '30_days'); // today, 7_days, 30_days, 90_days, 1_year

        $startDate = match ($period) {
            'today' => Carbon::today()->startOfDay(),
            '7_days' => Carbon::now()->subDays(7),
            '30_days' => Carbon::now()->subDays(30),
            '90_days' => Carbon::now()->subDays(90),
            '1_year' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(30),
        };

        // Generate date series based on period
        $dates = [];
        $format = 'Y-m-d';

        if ($period === 'today') {
            // Hourly breakdown for today
            for ($hour = 0; $hour < 24; $hour++) {
                $dates[] = [
                    'label' => sprintf('%02d:00', $hour),
                    'count' => 0
                ];
            }

            $views = PageView::whereDate('created_at', Carbon::today())
                ->selectRaw('EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count')
                ->groupBy('hour')
                ->get();

            foreach ($views as $view) {
                $index = (int)$view->hour;
                $dates[$index]['count'] = (int)$view->count;
            }
        } else {
            // Daily breakdown
            $daysCount = match ($period) {
                '7_days' => 7,
                '90_days' => 90,
                '1_year' => 365,
                default => 30,
            };

            for ($i = $daysCount - 1; $i >= 0; $i--) {
                $day = Carbon::now()->subDays($i);
                $dates[] = [
                    'label' => $day->format('M d'),
                    'date' => $day->format($format),
                    'count' => 0
                ];
            }

            $views = PageView::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->get();

            foreach ($views as $view) {
                $dateStr = $view->date instanceof Carbon ? $view->date->format('Y-m-d') : $view->date;
                foreach ($dates as &$day) {
                    if ($day['date'] === $dateStr) {
                        $day['count'] = (int)$view->count;
                        break;
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $dates
        ]);
    }

    /**
     * Get most popular projects (Admin).
     */
    public function popularProjects()
    {
        $projects = PageView::where('trackable_type', Project::class)
            ->selectRaw('trackable_id, COUNT(*) as views_count')
            ->groupBy('trackable_id')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get();

        foreach ($projects as $project) {
            $projectData = Project::find($project->trackable_id);
            $project->title = $projectData ? $projectData->title : 'Projet supprimé';
            $project->slug = $projectData ? $projectData->slug : null;
        }

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

    /**
     * Get most popular posts (Admin).
     */
    public function popularPosts()
    {
        $posts = PageView::where('trackable_type', Post::class)
            ->selectRaw('trackable_id, COUNT(*) as views_count')
            ->groupBy('trackable_id')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get();

        foreach ($posts as $post) {
            $postData = Post::find($post->trackable_id);
            $post->title = $postData ? $postData->title : 'Article supprimé';
            $post->slug = $postData ? $postData->slug : null;
        }

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }
}


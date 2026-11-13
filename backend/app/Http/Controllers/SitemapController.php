<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Post;
use Illuminate\Http\Request;

class SitemapController extends Controller
{
    /**
     * Generate sitemap.xml (Public).
     */
    public function sitemap(Request $request)
    {
        $urls = [];

        $homeUrl = config('app.url', 'http://localhost:8000');
        $urls[] = [
            'loc' => rtrim($homeUrl, '/') . '/',
            'lastmod' => now()->toAtomString(),
            'changefreq' => 'daily',
            'priority' => '1.0',
        ];

        $urls[] = [
            'loc' => rtrim($homeUrl, '/') . '/projects',
            'lastmod' => now()->toAtomString(),
            'changefreq' => 'daily',
            'priority' => '0.8',
        ];

        $urls[] = [
            'loc' => rtrim($homeUrl, '/') . '/articles',
            'lastmod' => now()->toAtomString(),
            'changefreq' => 'daily',
            'priority' => '0.8',
        ];

        $urls[] = [
            'loc' => rtrim($homeUrl, '/') . '/contact',
            'lastmod' => now()->toAtomString(),
            'changefreq' => 'monthly',
            'priority' => '0.7',
        ];

        $projects = Project::where('status', 'published')
            ->where('status', 'published')
            ->orderBy('updated_at', 'desc')
            ->limit(50)
            ->get(['slug', 'updated_at']);

        foreach ($projects as $project) {
            $urls[] = [
                'loc' => rtrim($homeUrl, '/') . '/projects/' . $project->slug,
                'lastmod' => $project->updated_at->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.6',
            ];
        }

        $posts = Post::where('status', 'published')
            ->orderBy('updated_at', 'desc')
            ->limit(100)
            ->get(['slug', 'updated_at']);

        foreach ($posts as $post) {
            $urls[] = [
                'loc' => rtrim($homeUrl, '/') . '/articles/' . $post->slug,
                'lastmod' => $post->updated_at->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.6',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($urls as $url) {
            $xml .= '  <url>' . "\n";
            $xml .= '    <loc>' . htmlspecialchars($url['loc']) . '</loc>' . "\n";
            $xml .= '    <lastmod>' . $url['lastmod'] . '</lastmod>' . "\n";
            $xml .= '    <changefreq>' . $url['changefreq'] . '</changefreq>' . "\n";
            $xml .= '    <priority>' . $url['priority'] . '</priority>' . "\n";
            $xml .= '  </url>' . "\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    /**
     * Generate robots.txt (Public).
     */
    public function robots(Request $request)
    {
        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /admin\n";
        $content .= "Disallow: /login\n";
        $content .= "\n";
        $content .= "Sitemap: " . config('app.url', 'http://localhost:8000') . "/sitemap.xml\n";

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }
}


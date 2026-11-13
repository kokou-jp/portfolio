import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePageMeta } from '@/hooks/use-page-meta';
import { dashboardService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FolderOpen,
  FileText,
  Code2,
  MessageSquare,
  MailOpen,
  Download,
  Eye,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

const statCards = [
  { key: 'projects_count', label: 'Projets', icon: FolderOpen, color: 'text-blue-500' },
  { key: 'posts_count', label: 'Articles', icon: FileText, color: 'text-green-500' },
  { key: 'skills_count', label: 'Compétences', icon: Code2, color: 'text-purple-500' },
  { key: 'messages_count', label: 'Messages', icon: MessageSquare, color: 'text-orange-500' },
  { key: 'unread_messages_count', label: 'Non lus', icon: MailOpen, color: 'text-red-500' },
  { key: 'cv_downloads', label: 'Téléchargements CV', icon: Download, color: 'text-cyan-500' },
];

export default function DashboardPage() {
  usePageMeta({
    title: 'Tableau de bord',
    description: 'Vue d\'ensemble de votre portfolio.',
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: visits, isLoading: visitsLoading } = useQuery({
    queryKey: ['dashboard', 'visits', '30_days'],
    queryFn: () => dashboardService.getVisits('30_days'),
  });

  const { data: popularProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['dashboard', 'popular-projects'],
    queryFn: dashboardService.getPopularProjects,
  });

  const { data: popularPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['dashboard', 'popular-posts'],
    queryFn: dashboardService.getPopularPosts,
  });

  const statsData = stats?.data;
  const visitsData = visits?.data || [];
  const projectsData = popularProjects?.data || [];
  const postsData = popularPosts?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre portfolio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {statsData?.[card.key as keyof typeof statsData]?.toLocaleString() ?? 0}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visites aujourd'hui</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{statsData?.today_visits?.toLocaleString() ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{statsData?.week_visits?.toLocaleString() ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{statsData?.month_visits?.toLocaleString() ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{statsData?.total_visits?.toLocaleString() ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visites (30 derniers jours)</CardTitle>
          <CardDescription>Évolution du nombre de visites</CardDescription>
        </CardHeader>
        <CardContent>
          {visitsLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="label"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projets populaires</CardTitle>
            <CardDescription>Top 5 des projets les plus consultés</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {projectsData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucune donnée</p>
                ) : (
                  projectsData.map((project) => (
                    <div
                      key={project.trackable_id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {Number(project.views_count).toLocaleString()} vues
                        </p>
                      </div>
                      {project.slug && (
                        <Button variant="ghost" size="icon" asChild className="shrink-0">
                          <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Articles populaires</CardTitle>
            <CardDescription>Top 5 des articles les plus consultés</CardDescription>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {postsData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucune donnée</p>
                ) : (
                  postsData.map((post) => (
                    <div
                      key={post.trackable_id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {Number(post.views_count).toLocaleString()} vues
                        </p>
                      </div>
                      {post.slug && (
                        <Button variant="ghost" size="icon" asChild className="shrink-0">
                          <a href={`/articles/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

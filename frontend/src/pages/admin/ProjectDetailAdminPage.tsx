import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Calendar, Star, Eye } from 'lucide-react';
import { GithubIcon } from '@/components/ui/social-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { projectService } from '@/services/api';
import type { Project } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';
import { FilePreviewModal } from '@/components/media/FilePreviewModal';

export default function ProjectDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'project', id], queryFn: () => projectService.getAdminProject(id!), enabled: !!id });
  const project: Project | undefined = data?.data;
  usePageMeta({ title: project ? `Projet - ${project.title}` : 'Détail du projet', description: project?.short_description || '' });
  if (!id) return null;

  const gallery = [
    ...(project?.main_image_url ? [{ url: project.main_image_url, title: `${project?.title} - image principale` }] : []),
    ...(project?.images?.map((img, i) => ({ url: img.url, title: `${project?.title} - image ${i + 1}` })) || []),
  ];

  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button asChild variant="ghost"><Link to="/admin/projects"><ArrowLeft className="mr-2 h-4 w-4" />Retour aux projets</Link></Button>
        <div className="flex gap-2">
          {project?.demo_url && <Button variant="outline" asChild><a href={project.demo_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Démo</a></Button>}
          {project?.github_url && <Button variant="outline" asChild><a href={project.github_url} target="_blank" rel="noopener noreferrer"><GithubIcon className="mr-2 h-4 w-4" />GitHub</a></Button>}
        </div>
      </div>

      {isLoading ? <div className="space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="aspect-video w-full" /></div>
      : error || !project ? <p className="text-center text-muted-foreground py-12">{error ? 'Erreur lors du chargement du projet.' : 'Projet introuvable.'}</p>
      : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-hidden">
            {project.main_image_url && (
              <button type="button" className="aspect-video w-full overflow-hidden bg-muted relative group" onClick={() => setPreviewIndex(0)}>
                <img src={project.main_image_url} alt={project.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors"><Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100" /></div>
              </button>
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div><CardTitle className="text-3xl">{project.title}</CardTitle><p className="text-muted-foreground mt-2">{project.short_description}</p></div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>{project.status === 'published' ? 'Publié' : 'Brouillon'}</Badge>
                  {project.is_featured && <Badge variant="outline"><Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />Vedette</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.full_description && <div><h3 className="font-semibold mb-2">Description</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{project.full_description}</p></div>}
              {gallery.length > 1 && (
                <div>
                  <h3 className="font-semibold mb-3">Galerie</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((img, i) => (
                      <button key={i} type="button" className="aspect-video rounded-lg overflow-hidden border bg-muted" onClick={() => setPreviewIndex(i)}>
                        <img src={img.url} alt={img.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card><CardHeader><CardTitle>Informations</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Catégorie</span><span className="font-medium">{project.category?.name || '-'}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Date</span><span className="font-medium flex items-center gap-1">{project.project_date ? <><Calendar className="h-3.5 w-3.5" />{new Date(project.project_date).toLocaleDateString('fr-FR')}</> : '-'}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Créé le</span><span className="font-medium">{new Date(project.created_at).toLocaleDateString('fr-FR')}</span></div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Compétences</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{project.skills?.length ? project.skills.map((s) => <Badge key={s.id} variant="secondary">{s.name}</Badge>) : <p className="text-sm text-muted-foreground">Aucune compétence associée</p>}</div></CardContent></Card>
          </div>
        </div>
      )}
      <FilePreviewModal open={previewIndex !== null} onOpenChange={(o) => !o && setPreviewIndex(null)} item={previewIndex !== null ? gallery[previewIndex] : null} items={gallery} index={previewIndex ?? 0} onIndexChange={setPreviewIndex} />
    </div>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Calendar, Eye } from 'lucide-react';
import { GithubIcon } from '@/components/ui/social-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { projectService } from '@/services/api';
import type { Project } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';
import { FilePreviewModal } from '@/components/media/FilePreviewModal';

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: projectRes, isLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectService.getProject(slug!),
    enabled: !!slug,
  });

  usePageMeta({
    title: projectRes?.data?.title,
    description: projectRes?.data?.short_description,
    image: projectRes?.data?.main_image_url || undefined,
    canonical: projectRes?.data?.slug ? `https://jeanpaul.dev/projects/${projectRes.data.slug}` : undefined,
  });

  if (!slug) return null;

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux projets
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : !projectRes?.data ? (
          <p className="text-center text-muted-foreground">Projet introuvable.</p>
        ) : (
          <ProjectDetail project={projectRes.data} />
        )}
      </div>
    </div>
  );
}

function ProjectDetail({ project }: { project: Project }) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const skills = project.skills || [];
  const images = project.images || [];
  const gallery = [
    ...(project.main_image_url ? [{ url: project.main_image_url, title: project.title, mimeType: 'image/*', type: 'image' }] : []),
    ...images.map((img, i) => ({ url: img.url, title: `${project.title} - image ${i + 1}`, mimeType: 'image/*', type: 'image' })),
  ];

  return (
    <article className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <h1 className="text-4xl font-bold">{project.title}</h1>
          <div className="flex gap-2">
            {project.status === 'published' && <Badge variant="outline">Publié</Badge>}
            {project.is_featured && <Badge variant="secondary">Vedette</Badge>}
          </div>
        </div>

        {project.project_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.project_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</span>
          </div>
        )}

        {project.category && <Badge variant="outline" className="mt-2">{project.category.name}</Badge>}
      </header>

      {project.main_image_url && (
        <button type="button" className="aspect-video w-full overflow-hidden rounded-lg bg-muted relative group" onClick={() => setPreviewIndex(0)}>
          <img src={project.main_image_url} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors"><Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100" /></div>
        </button>
      )}

      <div className="space-y-4">
        {project.short_description && <p className="text-lg text-muted-foreground">{project.short_description}</p>}
        {project.full_description && <p className="leading-relaxed whitespace-pre-wrap">{project.full_description}</p>}
      </div>

      {skills.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Technologies utilisées</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => <Badge key={skill.id} variant="secondary" className="text-sm">{skill.name}</Badge>)}
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Galerie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, idx) => {
              const gIdx = project.main_image_url ? idx + 1 : idx;
              return (
                <button key={img.id} type="button" className="aspect-video rounded-lg overflow-hidden bg-muted group relative" onClick={() => setPreviewIndex(gIdx)}>
                  <img src={img.url} alt={`${project.title} - image ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center transition-colors"><Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" /></div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(project.github_url || project.demo_url) && (
        <div className="flex gap-4 flex-wrap">
          {project.github_url && <Button asChild><a href={project.github_url} target="_blank" rel="noopener noreferrer"><GithubIcon className="mr-2 h-4 w-4" />Voir sur GitHub</a></Button>}
          {project.demo_url && <Button asChild variant="outline"><a href={project.demo_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Voir la démo</a></Button>}
        </div>
      )}

      <FilePreviewModal open={previewIndex !== null} onOpenChange={(o) => !o && setPreviewIndex(null)} item={previewIndex !== null ? gallery[previewIndex] : null} items={gallery} index={previewIndex ?? 0} onIndexChange={setPreviewIndex} />
    </article>
  );
}



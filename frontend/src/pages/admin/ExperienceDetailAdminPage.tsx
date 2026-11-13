import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { timelineService } from '@/services/api';
import type { Experience } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';
import { formatDateRange } from '@/lib/utils';

export default function ExperienceDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'experience', id],
    queryFn: () => timelineService.getExperience(id!),
    enabled: !!id,
  });

  const experience: Experience | undefined = data?.data;

  usePageMeta({
    title: experience ? `Expérience - ${experience.position}` : 'Détail de l\'expérience',
    description: experience?.company || '',
  });

  if (!id) return null;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/admin/experiences">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux expériences
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-12">
            Une erreur est survenue lors du chargement de l'expérience.
          </p>
        ) : !experience ? (
          <p className="text-center text-muted-foreground">Expérience introuvable.</p>
        ) : (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{experience.position}</h1>
            <p className="text-xl text-muted-foreground">{experience.company}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateRange(experience.start_date, experience.end_date)}
            </p>
            {experience.location && (
              <p className="text-sm text-muted-foreground">{experience.location}</p>
            )}
            {experience.description && (
              <p className="text-sm text-muted-foreground mt-4">{experience.description}</p>
            )}
            {experience.technologies && (
              <div className="flex flex-wrap gap-2 mt-4">
                {experience.technologies.split(',').map((tech, i) => (
                  <span key={i} className="px-2 py-1 bg-secondary rounded text-xs">{tech.trim()}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

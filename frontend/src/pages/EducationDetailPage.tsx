import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, GraduationCap, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { timelineService } from '@/services/api';
import type { Education } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';
import { formatDateRange } from '@/lib/utils';

export default function EducationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['education', id],
    queryFn: () => timelineService.getEducation(id!),
    enabled: !!id,
  });

  const education: Education | undefined = data?.data;

  usePageMeta({
    title: education?.degree || 'Détail de la formation',
    description: education?.institution || '',
  });

  if (!id) return null;

  const dateRange = formatDateRange(education?.start_date, education?.end_date);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/educations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux formations
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-12">
            Une erreur est survenue lors du chargement de la formation. Veuillez réessayer plus tard.
          </p>
        ) : !education ? (
          <p className="text-center text-muted-foreground">Formation introuvable.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                {education.degree}
              </h1>
              <Badge variant={education.status === 'completed' ? 'default' : 'secondary'}>
                {education.status === 'completed' ? 'Terminé' : 'En cours'}
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-xl text-muted-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {education.institution}
              </p>

              {education.field_of_study && (
                <p className="text-muted-foreground">{education.field_of_study}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {dateRange}
                </span>
              </div>

              {education.description && (
                <div className="prose dark:prose-invert max-w-none">
                  <p>{education.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


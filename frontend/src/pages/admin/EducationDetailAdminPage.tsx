import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { timelineService } from '@/services/api';
import type { Education } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';
import { formatDateRange } from '@/lib/utils';

export default function EducationDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'education', id],
    queryFn: () => timelineService.getEducation(id!),
    enabled: !!id,
  });

  const education: Education | undefined = data?.data;

  usePageMeta({
    title: education ? `Formation - ${education.degree}` : 'Détail de la formation',
    description: education?.institution || '',
  });

  if (!id) return null;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/admin/educations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux formations
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-12">
            Une erreur est survenue lors du chargement de la formation.
          </p>
        ) : !education ? (
          <p className="text-center text-muted-foreground">Formation introuvable.</p>
        ) : (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{education.degree}</h1>
            <p className="text-xl text-muted-foreground">{education.institution}</p>
            {education.field_of_study && (
              <p className="text-muted-foreground">{education.field_of_study}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formatDateRange(education.start_date, education.end_date)}
            </p>
            {education.description && (
              <p className="text-sm text-muted-foreground mt-4">{education.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

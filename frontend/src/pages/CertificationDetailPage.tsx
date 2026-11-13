import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Award, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { timelineService } from '@/services/api';
import type { Certification } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function CertificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['certification', id],
    queryFn: () => timelineService.getCertification(id!),
    enabled: !!id,
  });

  const certification: Certification | undefined = data?.data;

  usePageMeta({
    title: certification?.name || 'Détail de la certification',
    description: certification?.organization || '',
  });

  if (!id) return null;

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/certifications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux certifications
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
            Une erreur est survenue lors du chargement de la certification. Veuillez réessayer plus tard.
          </p>
        ) : !certification ? (
          <p className="text-center text-muted-foreground">Certification introuvable.</p>
        ) : (
          <div className="space-y-6">
            {certification.image_url && (
              <div className="aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center relative">
                <Award className="h-16 w-16 text-muted-foreground" />
                <img
                  src={certification.image_url}
                  alt={certification.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Award className="h-8 w-8 text-primary" />
                  {certification.name}
                </h1>
                <Badge variant="outline" className="text-sm">
                  {new Date(certification.issue_date).getFullYear()}
                </Badge>
              </div>

              <p className="text-xl text-muted-foreground">{certification.organization}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(certification.issue_date).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {certification.credential_url && (
                <Button asChild variant="outline">
                  <a
                    href={certification.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Vérifier le certificat
                  </a>
                </Button>
              )}

              {certification.credential_id && (
                <p className="text-sm text-muted-foreground">
                  ID de la certification : {certification.credential_id}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


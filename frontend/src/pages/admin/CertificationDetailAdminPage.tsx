import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { certificationService } from '@/services/api';
import type { Certification } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function CertificationDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'certification', id],
    queryFn: () => certificationService.getCertification(id!),
    enabled: !!id,
  });

  const certification: Certification | undefined = data?.data;

  usePageMeta({
    title: certification ? `Certification - ${certification.name}` : 'Détail de la certification',
    description: certification?.organization || '',
  });

  if (!id) return null;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/admin/certifications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux certifications
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-12">
            Une erreur est survenue lors du chargement de la certification.
          </p>
        ) : !certification ? (
          <p className="text-center text-muted-foreground">Certification introuvable.</p>
        ) : (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{certification.name}</h1>
            <p className="text-xl text-muted-foreground">{certification.organization}</p>
            {certification.image_url && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img src={certification.image_url} alt={certification.name} className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Date d'obtention: {new Date(certification.issue_date).toLocaleDateString('fr-FR')}
            </p>
            {certification.credential_url && (
              <a href={certification.credential_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Vérifier le certificat
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

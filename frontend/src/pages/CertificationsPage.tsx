import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timelineService } from '@/services/api';
import type { Certification } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Award } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function CertificationsPage() {
  usePageMeta({
    title: 'Certifications',
    description: 'Découvrez mes certifications et reconnaissances professionnelles.',
  });

  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['certifications', 'public'],
    queryFn: () => timelineService.getCertifications(),
  });

  const certifications: Certification[] = data?.data || [];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Certifications</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Reconnaissances professionnelles et certifications obtenues au cours de ma carrière.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : certifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucune certification pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <Card
                key={cert.id}
                className="group transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate(`/certifications/${cert.id}`)}
              >
                <div className="aspect-video overflow-hidden rounded-t-lg bg-muted flex items-center justify-center relative">
                  <Award className="h-10 w-10 text-muted-foreground" />
                  {cert.image_url && (
                    <img
                      src={cert.image_url}
                      alt={cert.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading={index < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span>{cert.name}</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {new Date(cert.issue_date).getFullYear()}
                    </Badge>
                  </div>
                  <CardDescription>{cert.organization}</CardDescription>
                </CardHeader>
                <CardContent>
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Vérifier le certificat
                    </a>
                  )}
                  {cert.credential_id && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ID: {cert.credential_id}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { skillService } from '@/services/api';
import type { Skill } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function SkillDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'skill', id],
    queryFn: () => skillService.getSkill(id!),
    enabled: !!id,
  });

  const skill: Skill | undefined = data?.data;

  usePageMeta({
    title: skill ? `Compétence - ${skill.name}` : 'Détail de la compétence',
    description: skill?.category || '',
  });

  if (!id) return null;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/admin/skills">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux compétences
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-12">
            Une erreur est survenue lors du chargement de la compétence.
          </p>
        ) : !skill ? (
          <p className="text-center text-muted-foreground">Compétence introuvable.</p>
        ) : (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{skill.name}</h1>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Catégorie: {skill.category}</span>
              <span>Niveau: {skill.level}%</span>
              {skill.years_of_experience !== null && (
                <span>Expérience: {skill.years_of_experience} ans</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

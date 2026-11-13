import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timelineService } from '@/services/api';
import type { Education } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, GraduationCap } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { formatDateRange } from '@/lib/utils';

export default function EducationsPage() {
  usePageMeta({
    title: 'Formations',
    description: 'Découvrez mon parcours académique et mes formations.',
  });

  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['educations', 'public'],
    queryFn: () => timelineService.getEducations(),
  });

  const educations: Education[] = data?.data || [];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Formations</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Parcours académique et formations suivies.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-8 max-w-3xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : educations.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucune formation pour le moment.</p>
        ) : (
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
            <div className="space-y-8">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="relative flex items-start gap-6 cursor-pointer hover:bg-accent/30 rounded-lg p-2 transition-colors"
                  onClick={() => navigate(`/educations/${edu.id}`)}
                >
                  <div className="absolute left-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                  <div className="ml-8 w-full">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          {edu.degree}
                        </h3>
                        <p className="text-muted-foreground">{edu.institution}</p>
                        {edu.field_of_study && (
                          <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateRange(edu.start_date, edu.end_date)}</span>
                      </div>
                    </div>
                    {edu.description && (
                      <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


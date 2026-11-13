import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { timelineService } from '@/services/api';
import type { Education } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, GraduationCap } from 'lucide-react';
import { formatDateRange } from '@/lib/utils';

export default function EducationsSection() {
  const navigate = useNavigate();
  const { data: educationsRes, isLoading } = useQuery({
    queryKey: ['educations'],
    queryFn: () => timelineService.getEducations(),
  });

  const educations: Education[] = educationsRes?.data || [];

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-12 mx-auto" />
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="education" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Formations</h2>
        <p className="text-center text-muted-foreground mb-12">Parcours académique</p>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          <div className="space-y-8">
            {educations.map((edu) => (
              <EducationItem key={edu.id} education={edu} onNavigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EducationItem({ education, onNavigate }: { education: Education; onNavigate: (path: string) => void }) {
  const dateRange = formatDateRange(education.start_date, education.end_date);
  const handleClick = () => onNavigate(`/educations/${education.id}`);

  return (
    <div
      className="relative flex items-start gap-6 cursor-pointer hover:bg-accent/30 rounded-lg p-2 transition-colors"
      onClick={handleClick}
    >
      <div className="absolute left-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
      <div className="ml-8 w-full">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              {education.degree}
            </h3>
            <p className="text-muted-foreground">{education.institution}</p>
            {education.field_of_study && (
              <p className="text-sm text-muted-foreground">{education.field_of_study}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{dateRange}</span>
          </div>
        </div>
        {education.description && (
          <p className="text-sm text-muted-foreground mt-2">{education.description}</p>
        )}
      </div>
    </div>
  );
}

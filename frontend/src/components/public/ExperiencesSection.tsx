import { useQuery } from '@tanstack/react-query';
import { timelineService } from '@/services/api';
import type { Experience } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import { formatDateRange } from '@/lib/utils';

export default function ExperiencesSection() {
  const { data: experiencesRes, isLoading } = useQuery({
    queryKey: ['experiences'],
    queryFn: () => timelineService.getExperiences(),
  });

  const experiences: Experience[] = experiencesRes?.data || [];

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
    <section id="experience" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Expériences Professionnelles</h2>
        <p className="text-center text-muted-foreground mb-12">Parcours professionnel</p>

        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          <div className="space-y-8">
            {experiences.map((exp) => (
              <ExperienceItem key={exp.id} experience={exp} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceItem({ experience }: { experience: Experience }) {
  const startDate = experience.start_date;
  const endDate = experience.end_date ? experience.end_date : null;
  const dateRange = formatDateRange(startDate, endDate);

  return (
    <div className="relative flex flex-col md:flex-row md:gap-8">
      <div className="md:w-1/2 mb-4 md:mb-0">
        <div className="absolute left-4 md:left-1/2 top-0 -translate-x-1/2 md:-translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
        <div className="ml-10 md:ml-0">
          <h3 className="font-bold text-lg">{experience.company}</h3>
          <p className="text-primary font-medium">{experience.position}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            <span>{dateRange}</span>
          </div>
          {experience.location && (
            <p className="text-sm text-muted-foreground mt-1">{experience.location}</p>
          )}
        </div>
      </div>
      <div className="md:w-1/2 md:pl-8">
        {experience.description && (
          <p className="text-sm text-muted-foreground mb-2">{experience.description}</p>
        )}
        {experience.technologies && (
          <div className="flex flex-wrap gap-1.5">
            {experience.technologies.split(',').map((tech, i) => (
              <span key={i} className="px-2 py-1 text-xs bg-secondary rounded">
                {tech.trim()}
              </span>
            ))}
          </div>
        )}
        {experience.link && (
          <a
            href={experience.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-primary hover:underline"
          >
            {experience.link}
          </a>
        )}
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { skillService } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { Skill } from '@/types';
import { Code, Layout, Database, Server, Cloud, Wrench, Package } from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  Frontend: Layout,
  Backend: Server,
  Database: Database,
  DevOps: Cloud,
  Tools: Wrench,
  Other: Package,
};

const categoryLabels: Record<string, string> = {
  Frontend: 'Développement Frontend',
  Backend: 'Développement Backend',
  Database: 'Bases de données',
  DevOps: 'DevOps & Cloud',
  Tools: 'Outils',
  Other: 'Autres',
};

const skillIcons: Record<string, React.ElementType> = {
  react: Layout,
  typescript: Code,
  tailwind: Code,
  laravel: Server,
  php: Code,
  node: Server,
  postgresql: Database,
  supabase: Database,
  docker: Cloud,
  git: Wrench,
};

export default function SkillsSection() {
  const { data: skillsRes, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillService.getSkills(),
  });

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-12 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const skills = skillsRes?.data || [];

  const grouped: Record<string, Skill[]> = {};
  skills.forEach((skill) => {
    const cat = skill.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(skill);
  });

  const orderedCategories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Other'];

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Compétences</h2>
        <p className="text-center text-muted-foreground mb-12">Technologies et compétences techniques</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orderedCategories.map((category) => {
            const categorySkills = grouped[category] || [];
            if (categorySkills.length === 0) return null;

            const CategoryIcon = categoryIcons[category] || Code;

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{categoryLabels[category] || category}</h3>
                </div>
                <div className="space-y-3">
                  {categorySkills.map((skill) => {
                    const SkillIcon = skillIcons[skill.icon_name || ''] || Code;
                    return (
                      <div key={skill.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <SkillIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{skill.name}</span>
                          </div>
                          {skill.years_of_experience && (
                            <span className="text-xs text-muted-foreground">
                              {skill.years_of_experience}+ ans
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

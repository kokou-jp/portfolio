import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Search } from 'lucide-react';
import { GithubIcon } from '@/components/ui/social-icons';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { projectService } from '@/services/api';
import type { Category, Project } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function ProjectsPage() {
  usePageMeta({ title: 'Projets', description: 'Découvrez mes projets professionnels et personnels.' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectService.getProjects({ per_page: '50' }),
  });
  const { data: categoriesRes } = useQuery({ queryKey: ['categories'], queryFn: () => projectService.getCategories() });

  const projects: Project[] = projectsRes?.data?.data || [];
  const categories: Category[] = categoriesRes?.data || [];

  const filtered = useMemo(() => projects.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.short_description.toLowerCase().includes(q);
    const matchCat = !activeCategory || p.category?.slug === activeCategory || p.category_id === activeCategory;
    return matchSearch && matchCat;
  }), [projects, searchTerm, activeCategory]);

  const featured = filtered.filter((p) => p.is_featured);
  const others = filtered.filter((p) => !p.is_featured);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Mes Projets</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Découvrez mes projets professionnels et personnels, conçus avec passion et technologie.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un projet..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={activeCategory === null ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(null)}>Tous</Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={activeCategory === cat.slug ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(cat.slug)}>{cat.name}</Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucun projet ne correspond à votre recherche.</p>
        ) : (
          <div className="space-y-10">
            {featured.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Projets vedettes</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{featured.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
              </section>
            )}
            <section>
              {featured.length > 0 && <h2 className="text-xl font-semibold mb-4">Tous les projets</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{(featured.length > 0 ? others : filtered).map((p) => <ProjectCard key={p.id} project={p} />)}</div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-video overflow-hidden bg-muted">
        {project.main_image_url ? (
          <img src={project.main_image_url} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-muted-foreground">{project.title.charAt(0)}</div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          {project.category && <Badge variant="outline">{project.category.name}</Badge>}
        </div>
        <CardDescription className="line-clamp-2">{project.short_description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.skills?.slice(0, 4).map((skill) => <Badge key={skill.id} variant="secondary" className="text-xs">{skill.name}</Badge>)}
        </div>
        <div className="flex items-center gap-2">
          {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="p-1 text-muted-foreground hover:text-foreground" aria-label="GitHub"><GithubIcon className="h-4 w-4" /></a>}
          {project.demo_url && <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="p-1 text-muted-foreground hover:text-foreground" aria-label="Demo"><ExternalLink className="h-4 w-4" /></a>}
          <Button asChild variant="link" className="ml-auto p-0"><Link to={`/projects/${project.slug}`}>Voir le projet</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

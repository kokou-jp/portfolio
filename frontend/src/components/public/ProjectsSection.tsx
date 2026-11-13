import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ExternalLink, Search } from 'lucide-react';
import { GithubIcon } from '@/components/ui/social-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { projectService } from '@/services/api';
import type { Project, Category } from '@/types';

export default function ProjectsSection() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: projectsRes, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', 'featured'],
    queryFn: () => projectService.getProjects({ per_page: '6' }),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => projectService.getCategories(),
  });

  const projects: Project[] = projectsRes?.data?.data || [];
  const categories: Category[] = categoriesRes?.data || [];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.short_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || project.category?.slug === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Mes Projets</h2>
          <p className="text-muted-foreground">Sélection de projets que j'ai développés</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              Tous
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.slug)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucun projet ne correspond à votre recherche.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onNavigate={navigate} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button asChild>
            <Link to="/projects">
              Voir tous les projets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, onNavigate }: { project: Project; onNavigate: (path: string) => void }) {
  const handleClick = () => onNavigate(`/projects/${project.slug}`);

  return (
    <Card className="group transition-transform duration-200 hover:scale-[1.02] cursor-pointer" onClick={handleClick}>
      {project.main_image_url && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
            src={project.main_image_url}
            alt={project.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          {project.is_featured && (
            <Badge variant="outline" className="text-xs">
              Vedette
            </Badge>
          )}
        </div>
        <CardDescription>{project.short_description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills?.slice(0, 4).map((skill) => (
            <Badge key={skill.id} variant="secondary" className="text-xs">
              {skill.name}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
              onClick={(e) => e.stopPropagation()}
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Demo"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Button asChild variant="link" className="ml-auto p-0" onClick={(e) => e.stopPropagation()}>
            <Link to={`/projects/${project.slug}`}>Voir le projet</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

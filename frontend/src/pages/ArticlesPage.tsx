import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { postService } from '@/services/api';
import type { Post, PostCategory } from '@/types';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function ArticlesPage() {
  usePageMeta({
    title: 'Articles',
    description: 'Découvrez mes articles techniques sur le développement web, l\'architecture et la sécurité.',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: postsRes, isLoading: postsLoading, error } = useQuery({
    queryKey: ['posts', { search: searchTerm, category: activeCategory, tag: activeTag }],
    queryFn: () => postService.getPosts({
      search: searchTerm,
      category: activeCategory || undefined,
      tag: activeTag || undefined,
    }),
  });

  const { data: categoriesRes, error: _categoriesError } = useQuery({
    queryKey: ['post-categories'],
    queryFn: () => postService.getCategories(),
  });

  const posts: Post[] = postsRes?.data?.data || [];
  const postCategories: PostCategory[] = categoriesRes?.data || [];

  const allTags = Array.from(
    new Map(posts.flatMap((p) => p.tags || []).map((t) => [t.id, t])).values()
  );

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Articles</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez mes réflexions et tutoriels sur le développement web, l'architecture et la sécurité.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {postCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Button
              variant={activeCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveCategory(null);
                setActiveTag(null);
              }}
            >
              Tous
            </Button>
            {postCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveCategory(cat.slug);
                  setActiveTag(null);
                }}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        )}

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {allTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={activeTag === tag.slug ? 'default' : 'secondary'}
                className="text-xs cursor-pointer"
                onClick={() =>
                  setActiveTag(activeTag === tag.slug ? null : tag.slug)
                }
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {postsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-12">
            Une erreur est survenue lors du chargement des articles. Veuillez réessayer plus tard.
          </p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucun article ne correspond à votre recherche.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {(postsRes?.data?.last_page ?? 0) > 1 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" size="sm">
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {postsRes?.data?.current_page ?? 1} sur {postsRes?.data?.last_page ?? 1}
            </span>
            <Button variant="outline" size="sm">
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Card className="group h-full flex flex-col transition-shadow duration-200 hover:shadow-xl">
      {post.cover_image_url && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="flex-1">
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          <Link to={`/articles/${post.slug}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {post.summary || 'Cliquez pour lire l\'article...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{post.reading_time} min</span>
          </div>
          {post.published_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(post.published_at)}</span>
            </div>
          )}
        </div>
        {post.category && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {post.category.name}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}



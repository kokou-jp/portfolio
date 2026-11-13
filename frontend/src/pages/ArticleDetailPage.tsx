import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, Tag, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { postService } from '@/services/api';
import type { Post } from '@/types';
import { formatDate } from '@/lib/utils';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: postRes, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postService.getPost(slug!),
    enabled: !!slug,
  });

  usePageMeta({
    title: postRes?.data?.title,
    description: postRes?.data?.summary ?? undefined,
    image: postRes?.data?.cover_image_url || undefined,
    canonical: postRes?.data?.slug ? `https://jeanpaul.dev/articles/${postRes.data.slug}` : undefined,
  });

  if (!slug) return null;

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux articles
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-12">
            Une erreur est survenue lors du chargement de l'article. Veuillez réessayer plus tard.
          </p>
        ) : !postRes ? (
          <p className="text-center text-muted-foreground">Article introuvable.</p>
        ) : (
          <ArticleContent post={postRes.data} />
        )}
      </div>
    </div>
  );
}

function ArticleContent({ post }: { post: Post }) {
  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {post.published_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.published_at)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{post.reading_time} min de lecture</span>
          </div>
        </div>

        {post.category && (
          <Badge variant="secondary">
            <BookOpen className="h-3 w-3 mr-1" />
            {post.category.name}
          </Badge>
        )}
      </header>

      {post.cover_image_url && (
        <div className="aspect-video overflow-hidden rounded-lg">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {post.summary && (
        <p className="text-lg text-muted-foreground leading-relaxed">
          {post.summary}
        </p>
      )}

      <div className="prose dark:prose-invert max-w-none">
        <MarkdownRenderer content={post.content} />
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="border-t border-border pt-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Tags :</span>
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}



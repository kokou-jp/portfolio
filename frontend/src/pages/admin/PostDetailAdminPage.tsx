import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { postService } from '@/services/api';
import type { Post } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function PostDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'post', id],
    queryFn: () => postService.getAdminPost(id!),
    enabled: !!id,
  });

  const post: Post | undefined = data?.data;

  usePageMeta({
    title: post ? `Article - ${post.title}` : 'Détail de l\'article',
    description: post?.summary || '',
  });

  if (!id) return null;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/admin/posts">
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
            Une erreur est survenue lors du chargement de l'article.
          </p>
        ) : !post ? (
          <p className="text-center text-muted-foreground">Article introuvable.</p>
        ) : (
          <div className="space-y-6">
            {post.cover_image_url && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{post.title}</h1>
              <p className="text-muted-foreground mt-2">{post.summary}</p>
              <div className="mt-4 prose dark:prose-invert max-w-none">
                <p>{post.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

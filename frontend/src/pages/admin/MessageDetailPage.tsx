import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { contactService } from '@/services/api';
import type { Message } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['message', id],
    queryFn: () => contactService.getMessage(id!),
    enabled: !!id,
  });

  const message: Message | undefined = data?.data;

  const markReadMutation = useMutation({
    mutationFn: () => contactService.toggleRead(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message', id] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  useEffect(() => {
    if (message && !message.is_read && !markReadMutation.isPending) {
      markReadMutation.mutate();
    }
  }, [message, markReadMutation]);

  usePageMeta({
    title: message ? `Message de ${message.name}` : 'Détail du message',
    description: message?.subject || '',
  });

  if (!id) return null;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/admin/messages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux messages
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-12">
            Une erreur est survenue lors du chargement du message.
          </p>
        ) : !message ? (
          <p className="text-center text-muted-foreground">Message introuvable.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <h1 className="text-2xl font-bold">{message.subject}</h1>
              <Badge variant={message.is_read ? 'secondary' : 'default'}>
                {message.is_read ? 'Lu' : 'Non lu'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{message.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                  {message.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(message.created_at).toLocaleString('fr-FR')}</span>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

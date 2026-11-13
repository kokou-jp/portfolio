import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services/api';
import type { Media } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePageMeta } from '@/hooks/use-page-meta';
import { FileAvatar, detectFileKind } from '@/components/media/FileAvatar';

function getFileTypeCategory(mimeType: string): string {
  const k = detectFileKind(mimeType);
  if (k === 'image') return 'image';
  if (k === 'pdf') return 'pdf';
  if (['doc', 'sheet', 'slide', 'text'].includes(k)) return 'document';
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 octets';
  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function MediaPage() {
  usePageMeta({
    title: 'Médias',
    description: 'Bibliothèque de médias et fichiers.',
  });

  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['media', 'public'],
    queryFn: () => mediaService.getPublicMedia(),
  });

  const payload = data?.data as any;
  const mediaItems: Media[] = Array.isArray(payload) ? payload : (payload?.data || []);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Médias</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez la bibliothèque de médias et fichiers partagés.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : mediaItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucun média disponible pour le moment.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mediaItems.map((item) => {
              const fileType = getFileTypeCategory(item.mime_type);
              return (
                <Card
                  key={item.id}
                  className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
                  onClick={() => navigate(`/media/${item.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden relative">
                      <FileAvatar url={item.url} filename={item.filename} mimeType={item.mime_type} type={item.type} className="rounded-none" iconClassName="h-12 w-12" />
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-sm font-medium truncate" title={item.filename}>
                        {item.filename}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(item.file_size)}</span>
                        <Badge variant="outline" className="capitalize">
                          {fileType}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



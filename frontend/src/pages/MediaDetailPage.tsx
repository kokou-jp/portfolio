import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Eye, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mediaService } from '@/services/api';
import type { Media } from '@/types';
import { usePageMeta } from '@/hooks/use-page-meta';
import { FilePreviewModal } from '@/components/media/FilePreviewModal';
import { FileAvatar, detectFileKind } from '@/components/media/FileAvatar';

function formatFileSize(bytes: number): string { if (!bytes) return '0 octet'; const k = 1024; const sizes = ['octets','Ko','Mo','Go']; const i = Math.floor(Math.log(bytes)/Math.log(k)); return `${parseFloat((bytes/Math.pow(k,i)).toFixed(2))} ${sizes[i]}`; }

export default function MediaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useQuery({ queryKey: ['media', id], queryFn: () => mediaService.getPublicMediaDetail(id!), enabled: !!id });
  const media: Media | undefined = data?.data;
  usePageMeta({ title: media?.filename || 'Détail du média', description: media?.filename || '' });
  if (!id) return null;
  const kind = media ? detectFileKind(media.mime_type, media.filename, media.type) : 'file';

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6"><Link to="/media"><ArrowLeft className="mr-2 h-4 w-4" />Retour aux médias</Link></Button>
        {isLoading ? <div className="space-y-6"><Skeleton className="h-8 w-3/4" /><Skeleton className="aspect-video w-full" /></div>
        : error || !media ? <p className="text-center text-muted-foreground py-12">{error ? 'Erreur lors du chargement du média.' : 'Média introuvable.'}</p>
        : (
          <div className="space-y-6">
            <div className="aspect-video bg-muted rounded-xl overflow-hidden flex items-center justify-center border cursor-pointer" onClick={() => setOpen(true)}>
              <FileAvatar url={media.url} filename={media.filename} mimeType={media.mime_type} type={media.type} className="rounded-none" iconClassName="h-20 w-20" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold break-all">{media.filename}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="uppercase">{kind}</span>
                <span>{formatFileSize(media.file_size)}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(media.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setOpen(true)}><Eye className="mr-2 h-4 w-4" />Prévisualiser</Button>
                <Button variant="outline" asChild><a href={media.url} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" />Ouvrir / Télécharger</a></Button>
              </div>
            </div>
            <FilePreviewModal open={open} onOpenChange={setOpen} item={{ url: media.url, title: media.filename, filename: media.filename, mimeType: media.mime_type, type: media.type }} />
          </div>
        )}
      </div>
    </div>
  );
}

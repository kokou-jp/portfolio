import { Download, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type PreviewItem = {
  url: string;
  title?: string;
  filename?: string;
  mimeType?: string;
  type?: string;
};

function detectKind(item: PreviewItem) {
  const mime = (item.mimeType || '').toLowerCase();
  const name = (item.filename || item.title || item.url || '').toLowerCase();
  if (item.type === 'image' || mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(name)) return 'image';
  if (item.type === 'pdf' || mime === 'application/pdf' || /\.pdf(\?|$)/.test(name)) return 'pdf';
  if (/\.docx(\?|$)/.test(name) || mime.includes('wordprocessingml')) return 'docx';
  if (/\.doc(\?|$)/.test(name) || mime === 'application/msword') return 'doc';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'other';
}

function isPublicHttpUrl(url?: string) {
  if (!url) return false;
  try {
    const u = new URL(url, window.location.origin);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')) return false;
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function FilePreviewModal({
  open,
  onOpenChange,
  item,
  items,
  index = 0,
  onIndexChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PreviewItem | null;
  items?: PreviewItem[];
  index?: number;
  onIndexChange?: (i: number) => void;
}) {
  if (!item) return null;
  const kind = detectKind(item);
  const canNav = !!items && items.length > 1 && !!onIndexChange;
  const prev = () => canNav && onIndexChange!((index - 1 + items!.length) % items!.length);
  const next = () => canNav && onIndexChange!((index + 1) % items!.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="min-w-0">
            <p className="font-medium truncate">{item.title || item.filename || 'Aperçu'}</p>
            <p className="text-xs text-muted-foreground truncate">{item.mimeType || kind.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canNav && (
              <>
                <Button variant="outline" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-xs text-muted-foreground">{index + 1}/{items!.length}</span>
                <Button variant="outline" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
              </>
            )}
            {item.url && (
              <>
                <Button variant="outline" size="sm" asChild><a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Ouvrir</a></Button>
                <Button variant="outline" size="sm" asChild><a href={item.url} download target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" />Télécharger</a></Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex-1 min-h-0 bg-muted/30 flex items-center justify-center p-2 sm:p-4">
          {kind === 'image' && <img src={item.url} alt={item.title || item.filename || 'Aperçu'} className="max-h-full max-w-full object-contain rounded" />}
          {kind === 'pdf' && <iframe title={item.title || 'PDF'} src={item.url} className="w-full h-full rounded bg-white" />}
          {kind === 'docx' && (
            isPublicHttpUrl(item.url) ? (
              <div className="w-full h-full flex flex-col">
                <iframe title={item.title || 'Document'} src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.url)}`} className="w-full flex-1 rounded bg-white" />
                <p className="text-xs text-muted-foreground text-center py-2">Si l'aperçu ne s'affiche pas, utilisez Ouvrir ou Télécharger.</p>
              </div>
            ) : (
              <div className="text-center space-y-4 p-6 max-w-lg">
                <p className="text-muted-foreground">L'aperçu DOCX via Office en ligne nécessite une URL publique HTTPS accessible depuis Internet (non disponible en local).</p>
                {item.url && <div className="flex items-center justify-center gap-2 flex-wrap"><Button asChild><a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Ouvrir</a></Button><Button variant="outline" asChild><a href={item.url} download target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" />Télécharger</a></Button></div>}
              </div>
            )
          )}
          {kind === 'video' && <video controls src={item.url} className="max-h-full max-w-full rounded" />}
          {kind === 'audio' && <audio controls src={item.url} className="w-full max-w-xl" />}
          {(kind === 'doc' || kind === 'other') && (
            <div className="text-center space-y-4 p-6">
              <p className="text-muted-foreground">Aperçu non disponible pour ce format dans le navigateur.</p>
              {item.url && <Button asChild><a href={item.url} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" />Télécharger le fichier</a></Button>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

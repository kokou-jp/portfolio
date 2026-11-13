import { File, FileText, Image as ImageIcon, FileSpreadsheet, FileArchive, Film, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FileAvatarProps = {
  url?: string;
  filename?: string;
  mimeType?: string;
  type?: string;
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
};

function extOf(name?: string) {
  if (!name) return '';
  const clean = name.split('?')[0].split('#')[0];
  const i = clean.lastIndexOf('.');
  return i >= 0 ? clean.slice(i + 1).toLowerCase() : '';
}

export function detectFileKind(mimeType?: string, filename?: string, type?: string) {
  const mime = (mimeType || '').toLowerCase();
  const name = (filename || '').toLowerCase();
  const ext = extOf(filename);
  if (type === 'image' || mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/.test(name)) return 'image';
  if (type === 'pdf' || mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (mime.includes('wordprocessingml') || ext === 'docx' || ext === 'doc') return 'doc';
  if (mime.includes('spreadsheet') || mime.includes('excel') || ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'sheet';
  if (mime.includes('presentation') || mime.includes('powerpoint') || ext === 'pptx' || ext === 'ppt') return 'slide';
  if (mime.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/.test(name)) return 'video';
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(name)) return 'audio';
  if (mime.includes('zip') || mime.includes('archive') || /\.(zip|rar|7z|tar|gz)$/.test(name)) return 'archive';
  if (mime.startsWith('text/') || ext === 'txt' || ext === 'md') return 'text';
  return 'file';
}

export function FileAvatar({ url, filename, mimeType, type, className, iconClassName, showLabel = true }: FileAvatarProps) {
  const kind = detectFileKind(mimeType, filename, type);
  const ext = (extOf(filename) || (kind === 'file' ? 'DOC' : kind)).toUpperCase();

  if (kind === 'image' && url) {
    return (
      <div className={cn('h-full w-full overflow-hidden bg-muted flex items-center justify-center', className)}>
        <img src={url} alt={filename || 'image'} className="h-full w-full object-cover" loading="lazy" />
      </div>
    );
  }

  const styles: Record<string, { wrap: string; icon: string; Icon: any; label: string }> = {
    pdf: { wrap: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: 'text-red-600 dark:text-red-400', Icon: FileText, label: ext || 'PDF' },
    doc: { wrap: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: 'text-blue-600 dark:text-blue-400', Icon: FileText, label: ext || 'DOC' },
    sheet: { wrap: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: 'text-emerald-600 dark:text-emerald-400', Icon: FileSpreadsheet, label: ext || 'XLS' },
    slide: { wrap: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', icon: 'text-orange-600 dark:text-orange-400', Icon: FileText, label: ext || 'PPT' },
    video: { wrap: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: 'text-purple-600 dark:text-purple-400', Icon: Film, label: ext || 'VID' },
    audio: { wrap: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', icon: 'text-pink-600 dark:text-pink-400', Icon: Music, label: ext || 'AUD' },
    archive: { wrap: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', icon: 'text-amber-700 dark:text-amber-400', Icon: FileArchive, label: ext || 'ZIP' },
    text: { wrap: 'bg-slate-500/10 text-slate-600 dark:text-slate-300', icon: 'text-slate-600 dark:text-slate-300', Icon: FileText, label: ext || 'TXT' },
    file: { wrap: 'bg-muted text-muted-foreground', icon: 'text-muted-foreground', Icon: File, label: ext || 'FILE' },
    image: { wrap: 'bg-muted text-muted-foreground', icon: 'text-muted-foreground', Icon: ImageIcon, label: ext || 'IMG' },
  };
  const s = styles[kind] || styles.file;
  const Icon = s.Icon;

  return (
    <div className={cn('h-full w-full flex flex-col items-center justify-center gap-1 rounded-inherit', s.wrap, className)}>
      <Icon className={cn('h-8 w-8', s.icon, iconClassName)} />
      {showLabel && <span className="text-[10px] font-semibold tracking-wide leading-none px-1.5 py-0.5 rounded bg-background/60">{s.label.slice(0, 5)}</span>}
    </div>
  );
}

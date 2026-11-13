import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, MoreHorizontal, Search, Trash2, Upload, Download } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { mediaService } from '@/services/api';
import type { Media } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FilePreviewModal } from '@/components/media/FilePreviewModal';
import { FileAvatar, detectFileKind } from '@/components/media/FileAvatar';

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 octet';
  const k = 1024; const sizes = ['octets', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
function getFileTypeCategory(mimeType: string): string {
  const k = detectFileKind(mimeType);
  if (k === 'image') return 'image';
  if (k === 'pdf') return 'pdf';
  if (['doc', 'sheet', 'slide', 'text'].includes(k)) return 'document';
  return 'other';
}

export default function MediaAdminPage() {
  usePageMeta({ title: 'Médias', description: 'Gérez vos fichiers multimédias.' });
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['media', 'admin'], queryFn: mediaService.getMedia });
  const items = data?.data?.data || [];

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => mediaService.upload(formData),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media'] }); toast({ title: 'Fichier uploadé avec succès' }); setIsSheetOpen(false); setUploadFile(null); },
    onError: () => toast({ title: "Erreur lors de l'upload", variant: 'destructive' }),
  });
  const deleteMutation = useMutation({
    mutationFn: mediaService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media'] }); toast({ title: 'Fichier supprimé avec succès' }); setDeleteTarget(null); },
    onError: () => toast({ title: 'Erreur lors de la suppression', variant: 'destructive' }),
  });

  const filtered = useMemo(() => items.filter((m) => {
    if (searchQuery && !m.filename.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (typeFilter !== 'all' && getFileTypeCategory(m.mime_type) !== typeFilter) return false;
    return true;
  }), [items, searchQuery, typeFilter]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return toast({ title: 'Veuillez sélectionner un fichier', variant: 'destructive' });
    const fd = new FormData(); fd.append('file', uploadFile);
    uploadMutation.mutate(fd);
  };

  const previewItems = filtered.map((m) => ({ url: m.url, title: m.filename, filename: m.filename, mimeType: m.mime_type, type: m.type }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-3xl font-bold tracking-tight">Médias</h1><p className="text-muted-foreground">Gérez et prévisualisez vos fichiers multimédias</p></div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild><Button><Upload className="mr-2 h-4 w-4" />Importer</Button></SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>Importer un fichier</SheetTitle><SheetDescription>Sélectionnez un fichier à ajouter à la bibliothèque.</SheetDescription></SheetHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-6">
              <div className="space-y-2"><Label htmlFor="file">Fichier</Label><Input id="file" type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />{uploadFile && <p className="text-sm text-muted-foreground">{uploadFile.name} ({formatFileSize(uploadFile.size)})</p>}</div>
              <SheetFooter><SheetClose asChild><Button type="button" variant="outline">Annuler</Button></SheetClose><Button type="submit" disabled={uploadMutation.isPending || !uploadFile}>{uploadMutation.isPending ? 'Upload...' : 'Uploader'}</Button></SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher un fichier..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">Tous</SelectItem><SelectItem value="image">Images</SelectItem><SelectItem value="pdf">PDF</SelectItem><SelectItem value="document">Documents</SelectItem><SelectItem value="other">Autres</SelectItem></SelectContent></Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <Card key={i}><CardContent className="p-0"><Skeleton className="aspect-square w-full" /><div className="p-3"><Skeleton className="h-4 w-3/4" /></div></CardContent></Card>)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">Aucun média trouvé</CardContent></Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((m, idx) => {
            const type = getFileTypeCategory(m.mime_type);
            return (
              <Card key={m.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <button type="button" className="w-full aspect-square bg-muted flex items-center justify-center overflow-hidden relative" onClick={() => setPreviewIndex(idx)}>
                    <FileAvatar url={m.url} filename={m.filename} mimeType={m.mime_type} type={m.type} className="rounded-none" iconClassName="h-12 w-12" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"><Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                  </button>
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate" title={m.filename}>{m.filename}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewIndex(idx); }}><Eye className="mr-2 h-4 w-4" />Prévisualiser</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(m.url, '_blank', 'noopener,noreferrer'); }}><Download className="mr-2 h-4 w-4" />Ouvrir/Télécharger</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(m); }}><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground"><Badge variant="secondary" className="uppercase">{type}</Badge><span>{formatFileSize(m.file_size)}</span></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer le fichier</AlertDialogTitle><AlertDialogDescription>Supprimer <strong>{deleteTarget?.filename}</strong> ? Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FilePreviewModal open={previewIndex !== null} onOpenChange={(o) => !o && setPreviewIndex(null)} item={previewIndex !== null ? previewItems[previewIndex] : null} items={previewItems} index={previewIndex ?? 0} onIndexChange={setPreviewIndex} />
    </div>
  );
}

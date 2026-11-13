import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, CheckCircle2, Eye, ExternalLink, FileClock, Pencil } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { cvService } from '@/services/api';
import type { CvFile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FilePreviewModal } from '@/components/media/FilePreviewModal';
import { FileAvatar } from '@/components/media/FileAvatar';
import { cn } from '@/lib/utils';

export default function CvAdminPage() {
  usePageMeta({ title: 'CV', description: 'Gérez vos fichiers CV.' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'draft' | 'published'>('draft');

  const [editTarget, setEditTarget] = useState<CvFile | null>(null);
  const [editVersion, setEditVersion] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'published'>('draft');

  const [deleteTarget, setDeleteTarget] = useState<CvFile | null>(null);
  const [preview, setPreview] = useState<CvFile | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['cv', 'admin'], queryFn: cvService.getAdminCVs });
  const cvs = data?.data || [];

  const statusOf = (cv: CvFile): 'draft' | 'published' => cv.status || (cv.is_active ? 'published' : 'draft');

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => cvService.upload(formData),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast({ title: res.message || "Erreur lors de l'upload", variant: 'destructive' });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['cv'] });
      toast({ title: 'CV uploadé avec succès' });
      setIsDialogOpen(false);
      setUploadFile(null);
      setVersion('');
      setUploadStatus('draft');
    },
    onError: () => toast({ title: "Erreur lors de l'upload", variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, version, status }: { id: string; version?: string; status: 'draft' | 'published' }) =>
      cvService.update(id, { version, status }),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast({ title: res.message || 'Erreur lors de la mise à jour', variant: 'destructive' });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['cv'] });
      toast({ title: 'CV mis à jour' });
      setEditTarget(null);
    },
    onError: () => toast({ title: 'Erreur lors de la mise à jour', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cvService.delete(id),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast({ title: res.message || 'Erreur lors de la suppression', variant: 'destructive' });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['cv'] });
      toast({ title: 'CV supprimé avec succès' });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: 'Erreur lors de la suppression', variant: 'destructive' }),
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return toast({ title: 'Veuillez sélectionner un fichier', variant: 'destructive' });
    const formData = new FormData();
    formData.append('file', uploadFile);
    if (version) formData.append('version', version);
    formData.append('status', uploadStatus);
    uploadMutation.mutate(formData);
  };

  const openEdit = (e: React.MouseEvent, cv: CvFile) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTarget(cv);
    setEditVersion(cv.version || '');
    setEditStatus(statusOf(cv));
  };

  const openDelete = (e: React.MouseEvent, cv: CvFile) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget(cv);
  };

  const openPreview = (e: React.MouseEvent, cv: CvFile) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(cv);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    updateMutation.mutate({ id: editTarget.id, version: editVersion || undefined, status: editStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CV</h1>
          <p className="text-muted-foreground">Gérez, prévisualisez et publiez vos fichiers CV</p>
        </div>
        <Button type="button" onClick={() => setIsDialogOpen(true)}><Upload className="mr-2 h-4 w-4" />Ajouter un CV</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>)}</div>
      ) : cvs.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">Aucun CV disponible</CardContent></Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cvs.map((cv) => {
            const st = statusOf(cv);
            const busy = (updateMutation.isPending && updateMutation.variables?.id === cv.id) || (deleteMutation.isPending && deleteMutation.variables === cv.id);
            return (
              <Card key={cv.id} className={cn('overflow-hidden', st === 'published' && 'ring-2 ring-primary shadow-md')}>
                <CardContent className="p-0">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border bg-muted/30">
                          <FileAvatar url={cv.url} filename={`${cv.version || 'cv'}.pdf`} mimeType="application/pdf" type="pdf" iconClassName="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate text-lg">{cv.version || 'CV sans version'}</p>
                          <p className="text-sm text-muted-foreground">Ajouté le {new Date(cv.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <Badge variant={st === 'published' ? 'default' : 'secondary'}>{st === 'published' ? 'Publié' : 'Brouillon'}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground">Téléchargements</p><p className="font-semibold text-base">{cv.download_count}</p></div>
                      <div className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground">Visibilité</p><p className={cn('font-semibold text-base', st === 'published' ? 'text-green-600' : '')}>{st === 'published' ? 'Public' : 'Masqué'}</p></div>
                    </div>
                  </div>
                  <div className="border-t p-4 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={(e) => openPreview(e, cv)}><Eye className="mr-2 h-4 w-4" />Prévisualiser</Button>
                    <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(cv.url, '_blank', 'noopener,noreferrer'); }}><ExternalLink className="mr-2 h-4 w-4" />Ouvrir</Button>
                    <Button type="button" variant="outline" size="sm" onClick={(e) => openEdit(e, cv)} disabled={busy}><Pencil className="mr-2 h-4 w-4" />Modifier</Button>
                    {st === 'published' ? (
                      <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateMutation.mutate({ id: cv.id, version: cv.version || undefined, status: 'draft' }); }} disabled={busy}><FileClock className="mr-2 h-4 w-4" />Brouillon</Button>
                    ) : (
                      <Button type="button" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateMutation.mutate({ id: cv.id, version: cv.version || undefined, status: 'published' }); }} disabled={busy}><CheckCircle2 className="mr-2 h-4 w-4" />Publier</Button>
                    )}
                    <Button type="button" variant="destructive" size="sm" onClick={(e) => openDelete(e, cv)} disabled={busy}><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(o) => { if (!o) { setIsDialogOpen(false); } else setIsDialogOpen(true); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un CV</DialogTitle><DialogDescription>Uploadez un fichier PDF. Choisissez son statut (brouillon ou publié).</DialogDescription></DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="version">Version</Label><Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="ex: v2.0 - 2026" /></div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={uploadStatus} onValueChange={(v) => setUploadStatus(v as 'draft' | 'published')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié (actif)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Publier ce CV désactivera le CV publié précédent.</p>
            </div>
            <div className="space-y-2"><Label htmlFor="cv-file">Fichier</Label><Input id="cv-file" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />{uploadFile && <p className="text-sm text-muted-foreground">Fichier sélectionné : {uploadFile.name}</p>}</div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={uploadMutation.isPending || !uploadFile}>{uploadMutation.isPending ? 'Envoi...' : 'Uploader'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le CV</DialogTitle><DialogDescription>Modifiez la version et le statut du CV.</DialogDescription></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="edit-version">Version</Label><Input id="edit-version" value={editVersion} onChange={(e) => setEditVersion(e.target.value)} placeholder="ex: v2.0 - 2026" /></div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as 'draft' | 'published')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié (actif)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Publier ce CV désactivera le CV publié précédent.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Annuler</Button>
              <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>Supprimer le CV <strong>{deleteTarget?.version || 'sans version'}</strong> ? Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FilePreviewModal open={!!preview} onOpenChange={(o) => { if (!o) setPreview(null); }} item={preview ? { url: preview.url, title: preview.version || 'CV', filename: `${preview.version || 'cv'}.pdf`, mimeType: 'application/pdf', type: 'pdf' } : null} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2 } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { postService } from '@/services/api';
import type { Post, PostCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Form = { title: string; summary: string; content: string; cover_image_url: string; category_id: string; status: 'draft' | 'published'; reading_time: number; tags: string };
const empty: Form = { title: '', summary: '', content: '', cover_image_url: '', category_id: '', status: 'draft', reading_time: 5, tags: '' };

export default function PostsAdminPage() {
  usePageMeta({ title: 'Articles', description: 'Gérez vos articles.' });
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'posts'], queryFn: () => postService.getAdminPosts() });
  const { data: cats } = useQuery({ queryKey: ['post-categories'], queryFn: () => postService.getCategories() });
  const posts = data?.data?.data || [];
  const categories: PostCategory[] = cats?.data || [];

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [], category_id: form.category_id || null, cover_image_url: form.cover_image_url || null, summary: form.summary || null };
      return editing ? postService.updatePost(editing.id, payload) : postService.createPost(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'posts'] }); toast({ title: editing ? 'Article mis à jour' : 'Article créé' }); setModalOpen(false); setEditing(null); },
    onError: () => toast({ title: 'Erreur lors de l\'enregistrement', variant: 'destructive' }),
  });
  const del = useMutation({ mutationFn: (id: string) => postService.deletePost(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'posts'] }); toast({ title: 'Article supprimé' }); setDeleteId(null); } });
  const bulkDel = useMutation({ mutationFn: () => Promise.all(selectedIds.map((id) => postService.deletePost(String(id)))), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'posts'] }); setSelectedIds([]); setBulkOpen(false); toast({ title: 'Articles supprimés' }); } });

  const filtered = useMemo(() => posts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [posts, search, statusFilter, categoryFilter]);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: Post) => { setEditing(p); setForm({ title: p.title, summary: p.summary || '', content: p.content || '', cover_image_url: p.cover_image_url || '', category_id: p.category_id || '', status: p.status, reading_time: p.reading_time || 5, tags: p.tags?.map(t => t.name).join(', ') || '' }); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Articles</h1><p className="text-muted-foreground">Gérez vos articles de blog</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nouvel article</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher par titre..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Statut" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem><SelectItem value="published">Publié</SelectItem><SelectItem value="draft">Brouillon</SelectItem></SelectContent></Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Catégorie" /></SelectTrigger><SelectContent><SelectItem value="all">Toutes les catégories</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedIds.length > 0 && <div className="mb-4 flex items-center gap-2"><span className="text-sm text-muted-foreground">{selectedIds.length} sélectionné(s)</span><Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button></div>}
          <DataTable data={filtered} loading={isLoading} searchable={false} selectable selectedIds={selectedIds} onSelectionChange={setSelectedIds} getRowId={(p) => p.id} onCreateClick={openCreate} createLabel="Nouvel article" onRowClick={openEdit} actions={{ label: 'Actions', items: [{ label: 'Modifier', onClick: openEdit }, { label: 'Supprimer', destructive: true, onClick: (p) => setDeleteId(p.id) }] }} columns={[
            { key: 'title', label: 'Titre', render: (p) => <span className="font-medium">{p.title}</span> },
            { key: 'category', label: 'Catégorie', render: (p) => p.category?.name || '-' },
            { key: 'status', label: 'Statut', render: (p) => <Badge variant={p.status === 'published' ? 'default' : 'secondary'}>{p.status === 'published' ? 'Publié' : 'Brouillon'}</Badge> },
            { key: 'published_at', label: 'Publication', render: (p) => p.published_at ? new Date(p.published_at).toLocaleDateString('fr-FR') : '-' },
          ]} />
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle><DialogDescription>Renseignez les informations de l'article.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Résumé</Label><Input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Contenu (Markdown)</Label><Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Image de couverture (URL)</Label><Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Catégorie</Label><Select value={form.category_id || 'none'} onValueChange={(v) => setForm({ ...form, category_id: v === 'none' ? '' : v })}><SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger><SelectContent><SelectItem value="none">Aucune</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Statut</Label><Select value={form.status} onValueChange={(v: 'draft'|'published') => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Brouillon</SelectItem><SelectItem value="published">Publié</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Temps de lecture (min)</Label><Input type="number" min={1} value={form.reading_time} onChange={(e) => setForm({ ...form, reading_time: Number(e.target.value) || 1 })} /></div>
            </div>
            <div className="grid gap-2"><Label>Tags (séparés par virgules)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, Laravel, API" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button><Button onClick={() => save.mutate()} disabled={save.isPending || !form.title || !form.content}>{editing ? 'Enregistrer' : 'Créer'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer l'article</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={bulkOpen} onOpenChange={setBulkOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Suppression groupée</AlertDialogTitle><AlertDialogDescription>Supprimer {selectedIds.length} article(s) ?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => bulkDel.mutate()} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

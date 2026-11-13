import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2 } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { timelineService } from '@/services/api';
import type { Education } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Form = { institution: string; degree: string; field_of_study: string; start_date: string; end_date: string; description: string; status: 'completed' | 'ongoing' };
const empty: Form = { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '', status: 'completed' };

export default function EducationsAdminPage() {
  usePageMeta({ title: 'Formations', description: 'Gérez vos formations.' });
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['educations'], queryFn: timelineService.getEducations });
  const items = data?.data || [];

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, end_date: form.end_date || null, description: form.description || null, field_of_study: form.field_of_study || null };
      return editing ? timelineService.updateEducation(editing.id, payload) : timelineService.createEducation(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['educations'] }); toast({ title: editing ? 'Formation mise à jour' : 'Formation créée' }); setModalOpen(false); setEditing(null); },
    onError: () => toast({ title: 'Erreur lors de l\'enregistrement', variant: 'destructive' }),
  });
  const del = useMutation({ mutationFn: (id: string) => timelineService.deleteEducation(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['educations'] }); toast({ title: 'Formation supprimée' }); setDeleteId(null); } });
  const bulkDel = useMutation({ mutationFn: () => Promise.all(selectedIds.map((id) => timelineService.deleteEducation(String(id)))), onSuccess: () => { qc.invalidateQueries({ queryKey: ['educations'] }); setSelectedIds([]); setBulkOpen(false); toast({ title: 'Formations supprimées' }); } });

  const filtered = useMemo(() => items.filter((e) => !search || e.institution.toLowerCase().includes(search.toLowerCase()) || e.degree.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (e: Education) => { setEditing(e); setForm({ institution: e.institution, degree: e.degree, field_of_study: e.field_of_study || '', start_date: e.start_date?.slice(0,10) || '', end_date: e.end_date?.slice(0,10) || '', description: e.description || '', status: (e.status as 'completed'|'ongoing') || 'completed' }); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Formations</h1><p className="text-muted-foreground">Gérez vos formations et diplômes</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nouvelle formation</Button>
      </div>
      <Card>
        <CardHeader><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher (institution, diplôme)..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div></CardHeader>
        <CardContent>
          {selectedIds.length > 0 && <div className="mb-4 flex items-center gap-2"><span className="text-sm text-muted-foreground">{selectedIds.length} sélectionnée(s)</span><Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button></div>}
          <DataTable data={filtered} loading={isLoading} searchable={false} selectable selectedIds={selectedIds} onSelectionChange={setSelectedIds} getRowId={(e) => e.id} onCreateClick={openCreate} createLabel="Nouvelle formation" onRowClick={openEdit} actions={{ label: 'Actions', items: [{ label: 'Modifier', onClick: openEdit }, { label: 'Supprimer', destructive: true, onClick: (e) => setDeleteId(e.id) }] }} columns={[
            { key: 'degree', label: 'Diplôme', render: (e) => <span className="font-medium">{e.degree}</span> },
            { key: 'institution', label: 'Institution' },
            { key: 'field_of_study', label: 'Domaine', render: (e) => e.field_of_study || '-' },
            { key: 'period', label: 'Période', render: (e) => `${e.start_date?.slice(0,10)} → ${e.end_date ? e.end_date.slice(0,10) : 'En cours'}` },
            { key: 'status', label: 'Statut', render: (e) => e.status === 'ongoing' ? 'En cours' : 'Terminée' },
          ]} />
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Modifier la formation' : 'Nouvelle formation'}</DialogTitle><DialogDescription>Renseignez les informations de la formation.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Diplôme</Label><Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} /></div><div className="grid gap-2"><Label>Institution</Label><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></div></div>
            <div className="grid gap-2"><Label>Domaine d'étude</Label><Input value={form.field_of_study} onChange={(e) => setForm({ ...form, field_of_study: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Date de début</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Date de fin</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Statut</Label><Select value={form.status} onValueChange={(v: 'completed'|'ongoing') => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="completed">Terminée</SelectItem><SelectItem value="ongoing">En cours</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button><Button onClick={() => save.mutate()} disabled={save.isPending || !form.degree || !form.institution || !form.start_date}>{editing ? 'Enregistrer' : 'Créer'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer la formation</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={bulkOpen} onOpenChange={setBulkOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Suppression groupée</AlertDialogTitle><AlertDialogDescription>Supprimer {selectedIds.length} formation(s) ?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => bulkDel.mutate()} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

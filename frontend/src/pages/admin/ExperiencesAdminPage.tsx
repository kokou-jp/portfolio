import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2 } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { timelineService } from '@/services/api';
import type { Experience } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Form = { company: string; position: string; description: string; start_date: string; end_date: string; location: string; technologies: string; link: string };
const empty: Form = { company: '', position: '', description: '', start_date: '', end_date: '', location: '', technologies: '', link: '' };

export default function ExperiencesAdminPage() {
  usePageMeta({ title: 'Expériences', description: 'Gérez vos expériences professionnelles.' });
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['experiences'], queryFn: timelineService.getExperiences });
  const items = data?.data || [];

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, end_date: form.end_date || null, description: form.description || null, location: form.location || null, technologies: form.technologies || null, link: form.link || null };
      return editing ? timelineService.updateExperience(editing.id, payload) : timelineService.createExperience(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences'] }); toast({ title: editing ? 'Expérience mise à jour' : 'Expérience créée' }); setModalOpen(false); setEditing(null); },
    onError: () => toast({ title: 'Erreur lors de l\'enregistrement', variant: 'destructive' }),
  });
  const del = useMutation({ mutationFn: (id: string) => timelineService.deleteExperience(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences'] }); toast({ title: 'Expérience supprimée' }); setDeleteId(null); } });
  const bulkDel = useMutation({ mutationFn: () => Promise.all(selectedIds.map((id) => timelineService.deleteExperience(String(id)))), onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences'] }); setSelectedIds([]); setBulkOpen(false); toast({ title: 'Expériences supprimées' }); } });

  const filtered = useMemo(() => items.filter((e) => !search || e.company.toLowerCase().includes(search.toLowerCase()) || e.position.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (e: Experience) => { setEditing(e); setForm({ company: e.company, position: e.position, description: e.description || '', start_date: e.start_date?.slice(0,10) || '', end_date: e.end_date?.slice(0,10) || '', location: e.location || '', technologies: e.technologies || '', link: e.link || '' }); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Expériences</h1><p className="text-muted-foreground">Gérez vos expériences professionnelles</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nouvelle expérience</Button>
      </div>
      <Card>
        <CardHeader><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher (entreprise, poste)..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div></CardHeader>
        <CardContent>
          {selectedIds.length > 0 && <div className="mb-4 flex items-center gap-2"><span className="text-sm text-muted-foreground">{selectedIds.length} sélectionnée(s)</span><Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button></div>}
          <DataTable data={filtered} loading={isLoading} searchable={false} selectable selectedIds={selectedIds} onSelectionChange={setSelectedIds} getRowId={(e) => e.id} onCreateClick={openCreate} createLabel="Nouvelle expérience" onRowClick={openEdit} actions={{ label: 'Actions', items: [{ label: 'Modifier', onClick: openEdit }, { label: 'Supprimer', destructive: true, onClick: (e) => setDeleteId(e.id) }] }} columns={[
            { key: 'position', label: 'Poste', render: (e) => <span className="font-medium">{e.position}</span> },
            { key: 'company', label: 'Entreprise' },
            { key: 'period', label: 'Période', render: (e) => `${e.start_date?.slice(0,10)} → ${e.end_date ? e.end_date.slice(0,10) : 'Présent'}` },
            { key: 'location', label: 'Lieu', render: (e) => e.location || '-' },
          ]} />
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Modifier l\'expérience' : 'Nouvelle expérience'}</DialogTitle><DialogDescription>Renseignez les informations de l'expérience professionnelle.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Poste</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div><div className="grid gap-2"><Label>Entreprise</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div></div>
            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Date de début</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div><div className="grid gap-2"><Label>Date de fin</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div></div>
            <div className="grid gap-2"><Label>Lieu</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Technologies (séparées par virgules)</Label><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Lien</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button><Button onClick={() => save.mutate()} disabled={save.isPending || !form.company || !form.position || !form.start_date}>{editing ? 'Enregistrer' : 'Créer'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer l'expérience</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={bulkOpen} onOpenChange={setBulkOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Suppression groupée</AlertDialogTitle><AlertDialogDescription>Supprimer {selectedIds.length} expérience(s) ?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => bulkDel.mutate()} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

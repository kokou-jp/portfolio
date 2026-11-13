import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2 } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { timelineService } from '@/services/api';
import type { Certification } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Form = { name: string; organization: string; issue_date: string; credential_id: string; credential_url: string; image_url: string };
const empty: Form = { name: '', organization: '', issue_date: '', credential_id: '', credential_url: '', image_url: '' };

export default function CertificationsAdminPage() {
  usePageMeta({ title: 'Certifications', description: 'Gérez vos certifications.' });
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['certifications'], queryFn: timelineService.getCertifications });
  const items = data?.data || [];

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, credential_id: form.credential_id || null, credential_url: form.credential_url || null, image_url: form.image_url || null };
      return editing ? timelineService.updateCertification(editing.id, payload) : timelineService.createCertification(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); toast({ title: editing ? 'Certification mise à jour' : 'Certification créée' }); setModalOpen(false); setEditing(null); },
    onError: () => toast({ title: 'Erreur lors de l\'enregistrement', variant: 'destructive' }),
  });
  const del = useMutation({ mutationFn: (id: string) => timelineService.deleteCertification(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); toast({ title: 'Certification supprimée' }); setDeleteId(null); } });
  const bulkDel = useMutation({ mutationFn: () => Promise.all(selectedIds.map((id) => timelineService.deleteCertification(String(id)))), onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); setSelectedIds([]); setBulkOpen(false); toast({ title: 'Certifications supprimées' }); } });

  const filtered = useMemo(() => items.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.organization.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (e: Certification) => { setEditing(e); setForm({ name: e.name, organization: e.organization, issue_date: e.issue_date?.slice(0,10) || '', credential_id: e.credential_id || '', credential_url: e.credential_url || '', image_url: e.image_url || '' }); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Certifications</h1><p className="text-muted-foreground">Gérez vos certifications</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nouvelle certification</Button>
      </div>
      <Card>
        <CardHeader><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher (nom, organisation)..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div></CardHeader>
        <CardContent>
          {selectedIds.length > 0 && <div className="mb-4 flex items-center gap-2"><span className="text-sm text-muted-foreground">{selectedIds.length} sélectionnée(s)</span><Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button></div>}
          <DataTable data={filtered} loading={isLoading} searchable={false} selectable selectedIds={selectedIds} onSelectionChange={setSelectedIds} getRowId={(e) => e.id} onCreateClick={openCreate} createLabel="Nouvelle certification" onRowClick={openEdit} actions={{ label: 'Actions', items: [{ label: 'Modifier', onClick: openEdit }, { label: 'Supprimer', destructive: true, onClick: (e) => setDeleteId(e.id) }] }} columns={[
            { key: 'name', label: 'Nom', render: (e) => <span className="font-medium">{e.name}</span> },
            { key: 'organization', label: 'Organisation' },
            { key: 'issue_date', label: 'Date', render: (e) => e.issue_date ? new Date(e.issue_date).toLocaleDateString('fr-FR') : '-' },
            { key: 'credential_url', label: 'Lien', render: (e) => e.credential_url ? <Button type="button" variant="link" className="h-auto p-0 text-primary" onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); window.open(e.credential_url!, '_blank', 'noopener,noreferrer'); }}>Voir</Button> : '-' },
          ]} />
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Modifier la certification' : 'Nouvelle certification'}</DialogTitle><DialogDescription>Renseignez les informations de la certification.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="grid gap-2"><Label>Organisation</Label><Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div></div>
            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Date d'obtention</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div><div className="grid gap-2"><Label>ID de certification</Label><Input value={form.credential_id} onChange={(e) => setForm({ ...form, credential_id: e.target.value })} /></div></div>
            <div className="grid gap-2"><Label>URL de vérification</Label><Input value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} placeholder="https://..." /></div>
            <div className="grid gap-2"><Label>URL de l'image</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
            {form.image_url && <img src={form.image_url} alt="Aperçu" className="h-32 w-full object-cover rounded-md border" />}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button><Button onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.organization || !form.issue_date}>{editing ? 'Enregistrer' : 'Créer'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer la certification</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={bulkOpen} onOpenChange={setBulkOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Suppression groupée</AlertDialogTitle><AlertDialogDescription>Supprimer {selectedIds.length} certification(s) ?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => bulkDel.mutate()} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

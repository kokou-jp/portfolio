import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2 } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { skillService } from '@/services/api';
import type { Skill } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Other'];

type SkillForm = {
  name: string;
  category: string;
  level: number;
  years_of_experience: string;
  icon_name: string;
  sort_order: number;
};

const emptyForm: SkillForm = { name: '', category: 'Frontend', level: 70, years_of_experience: '', icon_name: '', sort_order: 0 };

export default function SkillsAdminPage() {
  usePageMeta({ title: 'Compétences', description: 'Gérez vos compétences techniques.' });
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<SkillForm>(emptyForm);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['skills'], queryFn: skillService.getSkills });
  const skills = data?.data || [];

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        category: form.category,
        level: Number(form.level),
        years_of_experience: form.years_of_experience ? Number(form.years_of_experience) : null,
        icon_name: form.icon_name || null,
        sort_order: Number(form.sort_order) || 0,
      };
      return editing ? skillService.updateSkill(editing.id, payload) : skillService.createSkill(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills'] });
      toast({ title: editing ? 'Compétence mise à jour' : 'Compétence créée' });
      setModalOpen(false);
      setEditing(null);
    },
    onError: () => toast({ title: 'Erreur lors de l\'enregistrement', variant: 'destructive' }),
  });

  const del = useMutation({
    mutationFn: (id: string) => skillService.deleteSkill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills'] });
      toast({ title: 'Compétence supprimée' });
      setDeleteId(null);
    },
    onError: () => toast({ title: 'Erreur lors de la suppression', variant: 'destructive' }),
  });

  const bulkDel = useMutation({
    mutationFn: () => Promise.all(selectedIds.map((id) => skillService.deleteSkill(String(id)))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills'] });
      setSelectedIds([]);
      setBulkOpen(false);
      toast({ title: 'Compétences supprimées' });
    },
  });

  const filtered = useMemo(() => skills.filter((s) => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [skills, search, categoryFilter]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s: Skill) => {
    setEditing(s);
    setForm({ name: s.name, category: s.category, level: s.level, years_of_experience: s.years_of_experience?.toString() || '', icon_name: s.icon_name || '', sort_order: s.sort_order || 0 });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compétences</h1>
          <p className="text-muted-foreground">Gérez vos compétences techniques</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nouvelle compétence</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher une compétence..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[220px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedIds.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedIds.length} sélectionnée(s)</span>
              <Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button>
            </div>
          )}
          <DataTable
            data={filtered}
            columns={[
              { key: 'name', label: 'Nom', render: (s) => <span className="font-medium">{s.name}</span> },
              { key: 'category', label: 'Catégorie' },
              { key: 'level', label: 'Niveau', render: (s) => `${s.level}%` },
              { key: 'years_of_experience', label: 'Expérience', render: (s) => s.years_of_experience != null ? `${s.years_of_experience} an(s)` : '-' },
            ]}
            loading={isLoading}
            searchable={false}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            getRowId={(s) => s.id}
            onCreateClick={openCreate}
            createLabel="Nouvelle compétence"
            onRowClick={openEdit}
            actions={{ label: 'Actions', items: [{ label: 'Modifier', onClick: openEdit }, { label: 'Supprimer', destructive: true, onClick: (s) => setDeleteId(s.id) }] }}
          />
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier la compétence' : 'Nouvelle compétence'}</DialogTitle>
            <DialogDescription>Renseignez les informations de la compétence.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Niveau (%)</Label><Input type="number" min={1} max={100} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label>Années d'expérience</Label><Input type="number" min={0} value={form.years_of_experience} onChange={(e) => setForm({ ...form, years_of_experience: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Icône</Label><Input value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} placeholder="ex: react" /></div>
              <div className="grid gap-2"><Label>Ordre</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name}>{editing ? 'Enregistrer' : 'Créer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer la compétence</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Suppression groupée</AlertDialogTitle><AlertDialogDescription>Supprimer {selectedIds.length} compétence(s) ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => bulkDel.mutate()} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

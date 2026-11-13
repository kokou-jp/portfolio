import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { projectService, skillService } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Trash2,
  Search,
  Star,
} from 'lucide-react';
import type { Project, Category, Skill } from '@/types';

interface ProjectForm {
  title: string;
  short_description: string;
  full_description: string;
  main_image_url: string;
  category_id: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  github_url: string;
  demo_url: string;
  project_date: string;
  skills: string[];
  gallery: string;
}

const emptyForm: ProjectForm = {
  title: '',
  short_description: '',
  full_description: '',
  main_image_url: '',
  category_id: '',
  status: 'draft',
  is_featured: false,
  github_url: '',
  demo_url: '',
  project_date: '',
  skills: [],
  gallery: '',
};

export default function ProjectsAdminPage() {
  usePageMeta({
    title: 'Projets',
    description: 'Gérez vos projets.',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);

  const { data: projectsRes, isLoading: projectsLoading } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => projectService.getAdminProjects(),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => projectService.getCategories(),
  });

  const { data: skillsRes } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillService.getSkills(),
  });

  const projects: Project[] = projectsRes?.data?.data || [];
  const categories: Category[] = categoriesRes?.data || [];
  const allSkills: Skill[] = skillsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: unknown) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Projet créé avec succès' });
      closeModal();
    },
    onError: () => toast({ title: 'Erreur lors de la création', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => projectService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      toast({ title: 'Projet mis à jour' });
      closeModal();
    },
    onError: () => toast({ title: 'Erreur lors de la mise à jour', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      toast({ title: 'Projet supprimé' });
      setDeleteId(null);
    },
    onError: () => toast({ title: 'Erreur lors de la suppression', variant: 'destructive' }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => projectService.deleteProject(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      toast({ title: 'Projets supprimés avec succès' });
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    },
    onError: () => toast({ title: 'Erreur lors de la suppression en masse', variant: 'destructive' }),
  });

  const openCreateModal = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      short_description: project.short_description,
      full_description: project.full_description || '',
      main_image_url: project.main_image_url || '',
      category_id: project.category_id || '',
      status: project.status,
      is_featured: project.is_featured,
      github_url: project.github_url || '',
      demo_url: project.demo_url || '',
      project_date: project.project_date || '',
      skills: project.skills?.map(s => s.id) || [],
      gallery: project.images?.map(i => i.url).join('\n') || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = () => {
    const skills = form.skills.length > 0 ? form.skills : undefined;
    const gallery = form.gallery ? form.gallery.split('\n').filter(Boolean) : undefined;

    const payload = {
      ...form,
      skills,
      gallery,
      category_id: form.category_id || null,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSkill = (skillId: string) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skillId) ? f.skills.filter(s => s !== skillId) : [...f.skills, skillId],
    }));
  };

  const columns = [
    {
      key: 'title',
      label: 'Titre',
      render: (project: any) => (
        <div className="flex items-center gap-2">
          {project.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
          <span className="font-medium">{project.title}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Catégorie',
      render: (project: any) => project.category?.name || '-',
    },
    {
      key: 'status',
      label: 'Statut',
      render: (project: any) => (
        <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
          {project.status === 'published' ? 'Publié' : 'Brouillon'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date de création',
      render: (project: any) => new Date(project.created_at).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground">Gérez vos projets</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedIds.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedIds.length} sélectionné(s)</span>
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer la sélection
              </Button>
            </div>
          )}
          <DataTable
            data={filteredProjects}
            columns={columns}
            loading={projectsLoading}
            searchable={false}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            getRowId={(p) => p.id}
            onCreateClick={openCreateModal}
            createLabel="Nouveau projet"
            onRowClick={openEditModal}
            actions={{
              label: 'Actions',
              items: [
                { label: 'Modifier', onClick: openEditModal },
                { label: 'Supprimer', onClick: (p) => setDeleteId(p.id), destructive: true },
              ],
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
            <DialogDescription>
              {editingProject ? 'Modifiez les informations du projet.' : 'Remplissez les informations du nouveau projet.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="short_description">Description courte</Label>
              <Input id="short_description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full_description">Description complète</Label>
              <textarea
                id="full_description"
                value={form.full_description}
                onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="main_image_url">URL de l'image principale</Label>
              <Input id="main_image_url" value={form.main_image_url} onChange={(e) => setForm({ ...form, main_image_url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category_id">Catégorie</Label>
                <Select value={form.category_id} onValueChange={(value) => setForm({ ...form, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={form.status} onValueChange={(value: 'draft' | 'published') => setForm({ ...form, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_featured"
                checked={form.is_featured}
                onCheckedChange={(checked) => setForm({ ...form, is_featured: !!checked })}
              />
              <Label htmlFor="is_featured">Projet vedette</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="github_url">URL GitHub</Label>
              <Input id="github_url" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="demo_url">URL Démo</Label>
              <Input id="demo_url" value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project_date">Date du projet</Label>
              <Input id="project_date" type="date" value={form.project_date} onChange={(e) => setForm({ ...form, project_date: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Compétences</Label>
              <div className="flex flex-wrap gap-2">
                {allSkills.map(skill => (
                  <Badge
                    key={skill.id}
                    variant={form.skills.includes(skill.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill.id)}
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gallery">Galerie (une URL par ligne)</Label>
              <textarea
                id="gallery"
                value={form.gallery}
                onChange={(e) => setForm({ ...form, gallery: e.target.value })}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingProject ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suppression en masse</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedIds.length} projet(s) ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds).map(String))} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

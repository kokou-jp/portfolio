import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, Link as LinkIcon, Upload } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { profileService } from '@/services/api';
import type { SocialLink } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const emptySocialLink: Omit<SocialLink, 'id' | 'profile_id' | 'sort_order' | 'is_active'> = { platform: '', url: '', icon: null };

export default function ProfileAdminPage() {
  usePageMeta({ title: 'Profil', description: 'Modifiez les informations de votre profil.' });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({ title: '', bio: '', location: '', availability_status: '', phone: '', avatar_url: '', long_bio: '' });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newLink, setNewLink] = useState(emptySocialLink);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLinkTarget, setDeleteLinkTarget] = useState<SocialLink | null>(null);

  const { data } = useQuery({ queryKey: ['profile', 'admin'], queryFn: profileService.getAdminProfile });
  const profile = data?.data;

  useEffect(() => {
    if (profile) {
      setFormData({
        title: profile.title || '', bio: profile.bio || '', location: profile.location || '',
        availability_status: profile.availability_status || '', phone: profile.phone || '',
        avatar_url: profile.avatar_url || '', long_bio: profile.long_bio || '',
      });
      setSocialLinks(profile.social_links || []);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); toast({ title: 'Profil mis à jour avec succès' }); },
    onError: () => toast({ title: 'Erreur lors de la mise à jour du profil', variant: 'destructive' }),
  });
  const updateSocialLinksMutation = useMutation({
    mutationFn: profileService.updateSocialLinks,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); toast({ title: 'Liens sociaux mis à jour avec succès' }); },
    onError: () => toast({ title: 'Erreur lors de la mise à jour des liens', variant: 'destructive' }),
  });

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'image');
      const base = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${base}/admin/media`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      const json = await res.json();
      if (!res.ok || !json?.data?.url) throw new Error(json?.message || 'Upload échoué');
      setFormData((p) => ({ ...p, avatar_url: json.data.url }));
      toast({ title: 'Photo de profil importée' });
    } catch (e) {
      toast({ title: "Impossible d'importer l'image", description: e instanceof Error ? e.message : undefined, variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfileMutation.mutateAsync(formData);
      await updateSocialLinksMutation.mutateAsync(socialLinks.map((link) => ({ id: link.id?.startsWith('temp-') ? undefined : link.id, platform: link.platform, url: link.url, icon: link.icon, is_active: link.is_active, sort_order: link.sort_order } as any)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLink = () => {
    if (!newLink.platform || !newLink.url) return toast({ title: 'Veuillez remplir la plateforme et l\'URL', variant: 'destructive' });
    setSocialLinks([...socialLinks, { id: `temp-${Date.now()}`, profile_id: '', platform: newLink.platform, url: newLink.url, icon: newLink.icon, sort_order: socialLinks.length, is_active: true }]);
    setNewLink(emptySocialLink);
  };

  const initials = (formData.title || 'JP').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Profil</h1><p className="text-muted-foreground">Modifiez les informations de votre profil</p></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Photo de profil</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 ring-4 ring-muted"><AvatarImage src={formData.avatar_url || undefined} alt={formData.title} /><AvatarFallback className="text-2xl">{initials}</AvatarFallback></Avatar>
              <div className="w-full space-y-3">
                <div className="space-y-2"><Label htmlFor="avatar_url">URL de l'image</Label><Input id="avatar_url" value={formData.avatar_url} onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} placeholder="https://..." /></div>
                <div className="space-y-2">
                  <Label>Importer depuis l'appareil</Label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
                  <Button type="button" variant="outline" className="w-full" onClick={() => fileRef.current?.click()} disabled={isUploadingAvatar}><Upload className="mr-2 h-4 w-4" />{isUploadingAvatar ? 'Import...' : 'Choisir une image'}</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="title">Titre</Label><Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="ex: Développeur Full-Stack" /></div>
              <div className="space-y-2"><Label htmlFor="bio">Bio courte</Label><Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} /></div>
              <div className="space-y-2"><Label htmlFor="long_bio">Bio longue</Label><Textarea id="long_bio" value={formData.long_bio} onChange={(e) => setFormData({ ...formData, long_bio: e.target.value })} rows={6} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="location">Localisation</Label><Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="phone">Téléphone</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="availability_status">Statut de disponibilité</Label><Input id="availability_status" value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })} /></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Liens sociaux</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {socialLinks.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">Aucun lien social ajouté</p> : (
              <div className="space-y-3">{socialLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><LinkIcon className="h-4 w-4 text-primary" /></div><div><p className="text-sm font-medium capitalize">{link.platform}</p><p className="text-xs text-muted-foreground truncate max-w-xs">{link.url}</p></div></div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteLinkTarget(link)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div>
              ))}</div>
            )}
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2"><Label htmlFor="platform">Plateforme</Label><Input id="platform" value={newLink.platform} onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })} placeholder="ex: github" /></div>
              <div className="space-y-2"><Label htmlFor="url">URL</Label><Input id="url" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="https://..." /></div>
              <div className="space-y-2"><Label htmlFor="icon">Icône (optionnel)</Label><Input id="icon" value={newLink.icon || ''} onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })} placeholder="Nom de l'icône" /></div>
            </div>
            <Button type="button" variant="outline" onClick={handleAddLink}><Plus className="mr-2 h-4 w-4" />Ajouter un lien</Button>
          </CardContent>
        </Card>

        <div className="flex justify-end"><Button type="submit" disabled={isSubmitting || updateProfileMutation.isPending || updateSocialLinksMutation.isPending}><Save className="mr-2 h-4 w-4" />{isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}</Button></div>
      </form>

      <AlertDialog open={!!deleteLinkTarget} onOpenChange={() => setDeleteLinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer le lien social</AlertDialogTitle><AlertDialogDescription>Supprimer le lien <strong>{deleteLinkTarget?.platform}</strong> ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteLinkTarget) setSocialLinks(socialLinks.filter((l) => l.id !== deleteLinkTarget.id)); setDeleteLinkTarget(null); }} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

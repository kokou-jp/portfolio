import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2 } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { settingsService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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

interface SettingEntry {
  key: string;
  value: string;
}

export default function SettingsAdminPage() {
  usePageMeta({
    title: 'Paramètres',
    description: 'Modifiez les paramètres de votre site.',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetTarget, setResetTarget] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: settingsService.getSettings,
  });

  useEffect(() => {
    if (data?.data) {
      const entries = Object.entries(data.data).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setSettings(entries);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: 'Paramètres enregistrés avec succès' });
    },
    onError: () => {
      toast({ title: 'Erreur lors de l\'enregistrement', variant: 'destructive' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = {};
      settings.forEach((setting) => {
        payload[setting.key] = setting.value;
      });
      await updateMutation.mutateAsync(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSetting = () => {
    setSettings([...settings, { key: '', value: '' }]);
  };

  const handleRemoveSetting = (index: number) => {
    setSettings(settings.filter((_, i) => i !== index));
    setResetTarget(null);
  };

  const updateSetting = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...settings];
    updated[index] = { ...updated[index], [field]: val };
    setSettings(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Modifiez les paramètres de votre site</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : settings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucun paramètre disponible
              </p>
            ) : (
              <div className="space-y-4">
                {settings.map((setting, index) => (
                  <div
                    key={`${setting.key}-${index}`}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`key-${index}`}>Clé</Label>
                      <Input
                        id={`key-${index}`}
                        value={setting.key}
                        onChange={(e) => updateSetting(index, 'key', e.target.value)}
                        placeholder="ex: site_name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`value-${index}`}>Valeur</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`value-${index}`}
                          value={setting.value}
                          onChange={(e) => updateSetting(index, 'value', e.target.value)}
                          placeholder="Valeur"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setResetTarget(setting.key)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleAddSetting}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un paramètre
              </Button>
              <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer tout'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <AlertDialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le paramètre</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le paramètre{' '}
              <strong>{resetTarget}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (resetTarget) {
                  const index = settings.findIndex((s) => s.key === resetTarget);
                  if (index >= 0) handleRemoveSetting(index);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

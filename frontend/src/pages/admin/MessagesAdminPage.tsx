import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Search, Trash2, CheckCheck, Circle, User } from 'lucide-react';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useToast } from '@/hooks/use-toast';
import { contactService } from '@/services/api';
import type { Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export default function MessagesAdminPage() {
  usePageMeta({ title: 'Messagerie', description: 'Consultez et gérez vos messages de contact.' });
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['messages', 'admin'], queryFn: contactService.getMessages });
  const messages: Message[] = data?.data?.data || [];

  const markRead = useMutation({
    mutationFn: (id: string) => contactService.toggleRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => contactService.deleteMessage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['messages'] }); toast({ title: 'Message supprimé' }); if (deleteTarget?.id === activeId) setActiveId(null); setDeleteTarget(null); },
    onError: () => toast({ title: 'Erreur lors de la suppression', variant: 'destructive' }),
  });

  const filtered = useMemo(() => messages.filter((m) => {
    if (filter === 'read' && !m.is_read) return false;
    if (filter === 'unread' && m.is_read) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
    }
    return true;
  }), [messages, search, filter]);

  useEffect(() => {
    if (!activeId && filtered.length) setActiveId(filtered[0].id);
    if (activeId && !filtered.some((m) => m.id === activeId)) setActiveId(filtered[0]?.id || null);
  }, [filtered, activeId]);

  const active = filtered.find((m) => m.id === activeId) || messages.find((m) => m.id === activeId) || null;

  useEffect(() => {
    if (active && !active.is_read && !markRead.isPending) markRead.mutate(active.id);
  }, [active?.id, active?.is_read]);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-4 h-[calc(100vh-10rem)] min-h-[520px] flex flex-col">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messagerie</h1>
          <p className="text-muted-foreground">Interface de discussion · {unreadCount} non lu{unreadCount > 1 ? 's' : ''}</p>
        </div>
      </div>

      <Card className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full grid grid-cols-1 md:grid-cols-[360px_1fr]">
          <div className="border-r flex flex-col min-h-0 bg-muted/20">
            <div className="p-3 space-y-2 border-b bg-background">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher une conversation..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-1">
                {([['all','Tous'],['unread','Non lus'],['read','Lus']] as const).map(([v,l]) => (
                  <Button key={v} size="sm" variant={filter===v?'default':'ghost'} className="flex-1" onClick={() => setFilter(v)}>{l}</Button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Chargement...</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Aucune conversation</div>
              ) : filtered.map((m) => (
                <button key={m.id} onClick={() => setActiveId(m.id)} className={cn('w-full text-left p-3 border-b hover:bg-accent/60 transition-colors flex gap-3', activeId===m.id && 'bg-accent')}>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">{m.name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('truncate', !m.is_read ? 'font-semibold' : 'font-medium')}>{m.name}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className={cn('text-sm truncate', !m.is_read ? 'text-foreground' : 'text-muted-foreground')}>{m.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                  </div>
                  <div className="shrink-0 pt-1">{m.is_read ? <CheckCheck className="h-4 w-4 text-muted-foreground" /> : <Circle className="h-3 w-3 fill-primary text-primary" />}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col min-h-0 bg-[#efeae2] dark:bg-muted/10">
            {!active ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">Sélectionnez une conversation pour afficher les messages</div>
            ) : (
              <>
                <div className="px-4 py-3 border-b bg-background flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">{active.name.charAt(0).toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{active.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{active.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={active.is_read ? 'secondary' : 'default'}>{active.is_read ? 'Lu' : 'Non lu'}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(active)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <div className="flex justify-center"><span className="text-xs bg-background/80 border rounded-full px-3 py-1 text-muted-foreground">{new Date(active.created_at).toLocaleString('fr-FR')}</span></div>
                  <div className="max-w-2xl">
                    <div className="bg-background rounded-2xl rounded-tl-sm shadow-sm border p-4 space-y-2">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">{active.subject}</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{active.message}</p>
                      <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground pt-1">
                        <span>{new Date(active.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCheck className={cn('h-3.5 w-3.5', active.is_read ? 'text-blue-500' : '')} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" /><span>{active.name}</span>
                      <Mail className="h-3.5 w-3.5 ml-2" /><a href={`mailto:${active.email}`} className="text-primary hover:underline">{active.email}</a>
                    </div>
                  </div>
                  <div className="text-center text-xs text-muted-foreground pt-4">Les messages sont marqués comme lus automatiquement à l'ouverture.</div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer le message</AlertDialogTitle><AlertDialogDescription>Supprimer le message de <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteTarget && del.mutate(deleteTarget.id)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

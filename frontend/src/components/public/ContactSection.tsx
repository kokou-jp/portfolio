import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { contactService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: profileRes } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getPublicProfile(),
  });

  const { data: socialRes } = useQuery({
    queryKey: ['social-links'],
    queryFn: () => profileService.getSocialLinks(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await contactService.sendMessage(data);
      toast({
        title: 'Message envoyé !',
        description: 'Votre message a bien été envoyé. Je vous répondrai rapidement.',
      });
      reset();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'errors' in error
          ? 'Veuillez vérifier les champs du formulaire.'
          : 'Une erreur est survenue. Veuillez réessayer.';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const profile = profileRes?.data;
  const socialLinks = socialRes?.data || [];

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Contact</h2>
          <p className="text-muted-foreground">N'hésitez pas à me contacter pour toute collaboration ou question.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Coordonnées</h3>
            <div className="space-y-4">
              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href={`mailto:${profile?.user?.email || 'contact@jeanpaul.dev'}`}
                  className="hover:text-primary transition-colors"
                >
                  {profile?.user?.email || 'contact@jeanpaul.dev'}
                </a>
              </div>
              {profile?.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {socialLinks.filter((l) => l.is_active).length > 0 && (
              <div className="flex gap-3 pt-4">
                {socialLinks.filter((l) => l.is_active).map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={link.platform}
                  >
                    <SocialLinkIcon platform={link.platform} icon={link.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                placeholder="Votre nom"
                {...register('name')}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                {...register('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                placeholder="Sujet de votre message"
                {...register('subject')}
                aria-invalid={errors.subject ? 'true' : 'false'}
              />
              {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Votre message..."
                rows={5}
                {...register('message')}
                aria-invalid={errors.message ? 'true' : 'false'}
              />
              {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : 'Envoyer le message'}
              {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

function SocialLinkIcon({ platform, icon }: { platform: string; icon?: string | null }) {
  const iconName = icon || platform.toLowerCase();
  const iconMap: Record<string, React.ElementType> = {
    github: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 22v-6a3 3 0 0 0-.3-1.5 3 3 0 0 0-.9-1.1 4 4 0 0 0-.6-.4A10 10 0 0 0 21 6.8a10 10 0 0 0-2-1.7 9.9 9.9 0 0 0-.6-1.8 9 9 0 0 0-.9 0A9 9 0 0 0 12 7a9 9 0 0 0-6.4-1.4 9.9 9.9 0 0 0-.6 1.8 9.9 9.9 0 0 0-2 1.7A10 10 0 0 0 3 11c0 3 2 5 4 6-.7.6-1 1.4-1 2.4v2h6v-6a3 3 0 0 1 .3-1.5 3 3 0 0 1 .9-1.1 4 4 0 0 1 .6-.4 9.9 9.9 0 0 0 2 1.5 4 4 0 0 0 .6.4 3 3 0 0 1 1 1.1A3 3 0 0 1 15 18v4z" /></svg>,
    linkedin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v5h-4v-5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5H8v-5a6 6 0 0 1 6-6z" /><rect x="4" y="4" width="4" height="16" rx="1" /><circle cx="6" cy="6" r="1" /></svg>,
    twitter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.2-2 4v4.2a1 1 0 0 1-.7.9L14 14v3l-3-1H9l-2 2v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 .3-.7l3-3 2-2V8a6 6 0 0 1 7-7z" /></svg>,
  };
  const Icon = iconMap[iconName] || (() => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="8" /><line x1="12" y1="12" x2="16" y2="12" /></svg>);
  return <Icon />;
}

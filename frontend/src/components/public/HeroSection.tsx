import { useState } from 'react';
import { ArrowRight, Download, Eye } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from '@/components/ui/social-icons';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { profileService, cvService, settingsService } from '@/services/api';
import type { Profile, SocialLink, CvFile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { FilePreviewModal } from '@/components/media/FilePreviewModal';

const socialIcons: Record<string, React.ElementType> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  'Twitter/X': TwitterIcon,
  globe: ExternalLink,
};

export default function HeroSection() {
  const [showCv, setShowCv] = useState(false);

  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getPublicProfile(),
  });

  const { data: socialRes } = useQuery({
    queryKey: ['social-links'],
    queryFn: () => profileService.getSocialLinks(),
  });

  const { data: cvRes } = useQuery({
    queryKey: ['cv'],
    queryFn: () => cvService.getActive(),
    retry: false,
  });

  const { data: settingsRes } = useQuery({
    queryKey: ['settings-stats'],
    queryFn: () => settingsService.getPublicStats(),
    staleTime: 1000 * 60 * 10,
  });

  const settings = settingsRes?.data || {};

  const profile: Profile | undefined = profileRes?.data;
  const socialLinks: SocialLink[] = socialRes?.data || [];
  const activeCv: CvFile | undefined = cvRes?.data;

  const openCvInModal = async () => {
    if (!activeCv) return;
    setShowCv(true);
    try { await cvService.download(); } catch { /* ignore count failure */ }
  };

  const stats = [
    { label: 'Projets', value: settings.personal_projects_count || '10+' },
    { label: 'Technologies', value: settings.years_experience_count ? `${settings.years_experience_count}+` : '5+' },
    { label: "Années d'expérience", value: settings.years_experience_count || '5+' },
  ];

  if (profileLoading || !profile) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-16 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="text-xs font-medium">
              {profile.availability_status || 'Disponible pour un projet'}
            </Badge>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Bonjour, je suis <span className="text-primary">{profile.user?.name || 'Jean Paul'}</span>.
            </h1>

            <p className="text-xl text-muted-foreground max-w-md">
              {profile.title || 'Développeur Full-Stack'}
              <br />
              {profile.bio || 'Je conçois des applications web modernes, performantes et évolutives.'}
            </p>

            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <Button size="lg" asChild>
                <Link to="/projects">
                  Voir mes projets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {activeCv && (
                <>
                  <Button variant="outline" size="lg" onClick={openCvInModal}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir CV
                  </Button>
                  <Button variant="outline" size="lg" onClick={openCvInModal}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger CV
                  </Button>
                </>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.slice(0, 4).map((link) => {
                  const Icon = socialIcons[link.icon || link.platform] || ExternalLink;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={link.platform}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.user?.name || 'Portrait'}
                className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover ring-4 ring-muted shadow-xl"
              />
            ) : (
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-muted flex items-center justify-center ring-4 ring-muted shadow-xl">
                <span className="text-4xl font-bold text-muted-foreground">
                  {profile.user?.name?.charAt(0) || 'J'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-16 pt-8 border-t border-border">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <FilePreviewModal
        open={showCv}
        onOpenChange={setShowCv}
        item={activeCv ? { url: activeCv.url, title: activeCv.version || 'CV', filename: `${activeCv.version || 'cv'}.pdf`, mimeType: 'application/pdf', type: 'pdf' } : null}
      />
    </section>
  );
}

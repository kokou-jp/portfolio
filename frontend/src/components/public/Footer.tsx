import { Link } from 'react-router-dom';
import { Code2, ExternalLink } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from '@/components/ui/social-icons';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/api';
import type { SocialLink } from '@/types';

const footerNav = [
  { label: 'Accueil', href: '/' },
  { label: 'Projets', href: '/projects' },
  { label: 'Articles', href: '/articles' },
  { label: 'Formations', href: '/educations' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Médias', href: '/media' },
  { label: 'Contact', href: '/contact' },
];

const socialIcons: Record<string, React.ElementType> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  'Twitter/X': TwitterIcon,
  globe: ExternalLink,
};

export default function Footer() {
  const { data: profileRes } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getPublicProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: socialRes } = useQuery({
    queryKey: ['social-links'],
    queryFn: () => profileService.getSocialLinks(),
    staleTime: 1000 * 60 * 5,
  });

  const profile = profileRes?.data;
  const socialLinks: SocialLink[] = socialRes?.data || [];
  const displayName = profile?.user?.name || 'Jean Paul';
  const displayBio = profile?.bio || 'Développeur Full-Stack passionné par la création d\'applications web modernes.';

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <Code2 className="h-5 w-5 text-primary" />
              <span>{displayName}</span>
            </div>
            <p className="text-sm text-muted-foreground">{displayBio}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Navigation</h3>
            <nav className="flex flex-col gap-2 text-sm">
              {footerNav.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Réseaux sociaux</h3>
            <div className="flex items-center gap-3">
              {socialLinks.filter((l) => l.is_active).map((link) => {
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
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {displayName}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

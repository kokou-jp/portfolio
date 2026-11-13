import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, Download, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { useQuery } from '@tanstack/react-query';
import { profileService, cvService } from '@/services/api';
import type { Profile } from '@/types';
import { cn } from '@/lib/utils';
import { FilePreviewModal } from '@/components/media/FilePreviewModal';

const navItems = [
  { label: 'Accueil', href: '/' },
  { label: 'À propos', href: '/#about' },
  { label: 'Compétences', href: '/#skills' },
  { label: 'Projets', href: '/#projects' },
  { label: 'Expériences', href: '/#experience' },
  { label: 'Formations', href: '/educations' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Articles', href: '/articles' },
  { label: 'Médias', href: '/media' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCv, setShowCv] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const { data: profileRes } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getPublicProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: cvRes } = useQuery({
    queryKey: ['cv'],
    queryFn: () => cvService.getActive(),
    staleTime: 1000 * 60 * 5,
  });

  const profile: Profile | undefined = profileRes?.data;
  const activeCv = cvRes?.data;

  const openCvInModal = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!activeCv) return;
    setShowCv(true);
    try { await cvService.download(); } catch { /* ignore */ }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const id = href.substring(2);
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-border shadow-sm'
          : 'bg-background border-transparent'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Code2 className="h-6 w-6 text-primary" />
          <span>{profile?.user?.name ? profile.user.name.split(' ').pop() : 'Jean Paul'}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Changer le thème"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {activeCv && (
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={openCvInModal}>
              <Download className="h-4 w-4" />
              CV
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-background" aria-label="Navigation mobile">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
            {activeCv && (
              <Button variant="outline" size="sm" className="mt-2" onClick={openCvInModal}>
                <Download className="h-4 w-4" />
                Télécharger CV
              </Button>
            )}
          </div>
        </nav>
      )}

      <FilePreviewModal
        open={showCv}
        onOpenChange={setShowCv}
        item={activeCv ? { url: activeCv.url, title: activeCv.version || 'CV', filename: `${activeCv.version || 'cv'}.pdf`, mimeType: 'application/pdf', type: 'pdf' } : null}
      />
    </header>
  );
}

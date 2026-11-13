import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function NotFoundPage() {
  usePageMeta({
    title: '404 - Page non trouvée',
    description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    noindex: true,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 text-center">
        <div className="space-y-6 max-w-md mx-auto">
          <h1 className="text-8xl font-extrabold text-primary">404</h1>
          <h2 className="text-2xl font-bold">Page non trouvée</h2>
          <p className="text-muted-foreground">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Button asChild size="lg">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}



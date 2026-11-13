import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderOpen,
  Code2,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  MessageSquare,
  Image,
  File,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
  { to: '/admin/profile', icon: User, label: 'Profil' },
  { to: '/admin/projects', icon: FolderOpen, label: 'Projets' },
  { to: '/admin/skills', icon: Code2, label: 'Compétences' },
  { to: '/admin/experiences', icon: Briefcase, label: 'Expériences' },
  { to: '/admin/educations', icon: GraduationCap, label: 'Formations' },
  { to: '/admin/certifications', icon: Award, label: 'Certifications' },
  { to: '/admin/posts', icon: FileText, label: 'Articles' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/media', icon: Image, label: 'Médias' },
  { to: '/admin/cv', icon: File, label: 'CV' },
  { to: '/admin/settings', icon: Settings, label: 'Paramètres', adminOnly: true },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && user?.role !== 'ADMIN') return false;
    return true;
  });

  const themeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const ThemeIcon = themeIcon;

  return (
    <div className="min-h-screen bg-muted/40">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:hidden flex items-center gap-4 h-16 px-4 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            JP
          </div>
          <span className="font-bold">Admin</span>
        </div>
      </div>

      <div className="flex">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                JP
              </div>
              <span className="text-lg font-bold">Admin</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center gap-3 mb-3 px-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="hidden lg:flex items-center justify-between h-16 px-8 border-b bg-background">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Rechercher..."
                className="border-0 shadow-none focus-visible:ring-0 px-0"
              />
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="font-semibold">Notifications</span>
                    <span className="text-xs text-muted-foreground">3 nouvelles</span>
                  </div>
                  <div className="py-2">
                    <div className="px-4 py-2 hover:bg-accent cursor-pointer">
                      <p className="text-sm font-medium">Nouveau message</p>
                      <p className="text-xs text-muted-foreground">Jean a envoyé un message</p>
                    </div>
                    <div className="px-4 py-2 hover:bg-accent cursor-pointer">
                      <p className="text-sm font-medium">Article publié</p>
                      <p className="text-xs text-muted-foreground">Votre article est en ligne</p>
                    </div>
                    <div className="px-4 py-2 hover:bg-accent cursor-pointer">
                      <p className="text-sm font-medium">Mise à jour système</p>
                      <p className="text-xs text-muted-foreground">Maintenance prévue</p>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ThemeIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    Clair
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    Sombre
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    Système
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <main className="p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

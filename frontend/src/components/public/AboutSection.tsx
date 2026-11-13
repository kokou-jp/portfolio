import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

export default function AboutSection() {
  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getPublicProfile(),
  });

  const profile = profileRes?.data;

  if (isLoading || !profile) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8 mx-auto" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">À Propos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {profile.long_bio || profile.bio || 'Développeur passionné avec plus de 5 ans d\'expérience...'}
            </p>

            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.availability_status && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>{profile.availability_status}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {['Web Development', 'API Design', 'Cloud Architecture', 'Performance Optimization'].map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Portrait professionnel"
                className="w-full max-w-xs rounded-xl object-cover shadow-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-full max-w-xs rounded-xl bg-muted flex items-center justify-center shadow-lg">
                <span className="text-6xl font-bold text-muted-foreground">
                  {profile.user?.name?.charAt(0) || 'J'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

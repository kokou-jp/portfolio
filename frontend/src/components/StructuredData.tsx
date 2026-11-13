import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/api';
import type { Profile, SocialLink } from '@/types';

export default function StructuredData() {
  const { data: profileRes } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getPublicProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: socialRes } = useQuery({
    queryKey: ['social-links'],
    queryFn: () => profileService.getSocialLinks(),
  });

  const profile: Profile | undefined = profileRes?.data;
  const socialLinks: SocialLink[] = socialRes?.data || [];

  if (!profile) return null;

  const sameAs = socialLinks
    .filter((l) => l.is_active)
    .map((l) => l.url);

  const personData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.user?.name || 'Jean Paul',
    jobTitle: profile.title || 'Développeur Full-Stack',
    url: window.location.origin,
    sameAs,
    image: profile.avatar_url || undefined,
    description: profile.bio || '',
    knowsAbout: ['Web Development', 'API Design', 'Cloud Architecture', 'Database Design'],
    address: profile.location
      ? {
          '@type': 'PostalAddress',
          addressLocality: profile.location,
        }
      : undefined,
    email: profile.user?.email || undefined,
    telephone: profile.phone || undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personData) }}
    />
  );
}

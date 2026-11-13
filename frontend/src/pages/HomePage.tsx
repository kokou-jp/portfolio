import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';
import SkillsSection from '@/components/public/SkillsSection';
import ProjectsSection from '@/components/public/ProjectsSection';
import ExperiencesSection from '@/components/public/ExperiencesSection';
import EducationsSection from '@/components/public/EducationsSection';
import CertificationsSection from '@/components/public/CertificationsSection';
import ContactSection from '@/components/public/ContactSection';
import StructuredData from '@/components/StructuredData';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function HomePage() {
  usePageMeta({
    title: 'Accueil',
    description: 'Développeur Full-Stack passionné. Je conçois des applications web modernes, performantes et évolutives.',
  });

  return (
    <>
      <StructuredData />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperiencesSection />
      <EducationsSection />
      <CertificationsSection />
      <ContactSection />
    </>
  );
}



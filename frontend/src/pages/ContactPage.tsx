import ContactSection from '@/components/public/ContactSection';
import { usePageMeta } from '@/hooks/use-page-meta';

export default function ContactPage() {
  usePageMeta({
    title: 'Contact',
    description: 'Contactez-moi pour toute collaboration, question ou opportunité professionnelle.',
  });

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Vous avez un projet, une question, ou vous souhaitez collaborer ? N'hésitez pas à me contacter !
          </p>
        </div> */}

        <div className="max-w-3xl mx-auto">
          <ContactSection />
        </div>
      </div>
    </div>
  );
}



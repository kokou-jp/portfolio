<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\SocialLink;
use App\Models\Category;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\Skill;
use App\Models\Experience;
use App\Models\Education;
use App\Models\Certification;
use App\Models\PostCategory;
use App\Models\Post;
use App\Models\Tag;
use App\Models\Message;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin User
        $admin = User::create([
            'name' => 'Jean Paul',
            'email' => 'admin@portfolio.com',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
        ]);

        // 2. Profile
        $profile = Profile::create([
            'user_id' => $admin->id,
            'title' => 'Développeur Full-Stack Senior',
            'bio' => 'Je conçois des applications web modernes, performantes et évolutives.',
            'location' => 'Lomé, France',
            'availability_status' => 'Disponible pour un projet / CDI',
            'phone' => '+228 97 62 97 09',
            'avatar_url' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
            'long_bio' => "Développeur passionné avec plus de 5 ans d'expérience dans la création d'applications web robustes et évolutives. Spécialisé en PHP/Laravel pour le backend et React/TypeScript pour le frontend. J'attache une grande importance à la qualité du code, aux performances et à l'expérience utilisateur.",
        ]);

        // 3. Social Links
        SocialLink::create([
            'profile_id' => $profile->id,
            'platform' => 'GitHub',
            'url' => 'https://github.com',
            'icon' => 'github',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        SocialLink::create([
            'profile_id' => $profile->id,
            'platform' => 'LinkedIn',
            'url' => 'https://linkedin.com',
            'icon' => 'linkedin',
            'sort_order' => 2,
            'is_active' => true,
        ]);
        SocialLink::create([
            'profile_id' => $profile->id,
            'platform' => 'Twitter/X',
            'url' => 'https://twitter.com',
            'icon' => 'twitter',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // 4. Categories
        $webCat = Category::create(['name' => 'Web Development', 'slug' => 'web-development']);
        $mobileCat = Category::create(['name' => 'Mobile Apps', 'slug' => 'mobile-apps']);
        $devopsCat = Category::create(['name' => 'DevOps & Cloud', 'slug' => 'devops-cloud']);

        // 5. Skills
        $reactSkill = Skill::create(['name' => 'React', 'category' => 'Frontend', 'level' => 90, 'years_of_experience' => 4, 'sort_order' => 1, 'icon_name' => 'react']);
        $tsSkill = Skill::create(['name' => 'TypeScript', 'category' => 'Frontend', 'level' => 85, 'years_of_experience' => 3, 'sort_order' => 2, 'icon_name' => 'typescript']);
        $tailwindSkill = Skill::create(['name' => 'Tailwind CSS', 'category' => 'Frontend', 'level' => 95, 'years_of_experience' => 4, 'sort_order' => 3, 'icon_name' => 'wind']);
        
        $laravelSkill = Skill::create(['name' => 'Laravel', 'category' => 'Backend', 'level' => 90, 'years_of_experience' => 5, 'sort_order' => 1, 'icon_name' => 'laravel']);
        $phpSkill = Skill::create(['name' => 'PHP', 'category' => 'Backend', 'level' => 92, 'years_of_experience' => 5, 'sort_order' => 2, 'icon_name' => 'php']);
        $nodeSkill = Skill::create(['name' => 'Node.js', 'category' => 'Backend', 'level' => 80, 'years_of_experience' => 3, 'sort_order' => 3, 'icon_name' => 'node']);
        
        $postgresSkill = Skill::create(['name' => 'PostgreSQL', 'category' => 'Database', 'level' => 85, 'years_of_experience' => 4, 'sort_order' => 1, 'icon_name' => 'database']);
        $supabaseSkill = Skill::create(['name' => 'Supabase', 'category' => 'Database', 'level' => 80, 'years_of_experience' => 2, 'sort_order' => 2, 'icon_name' => 'supabase']);
        
        $dockerSkill = Skill::create(['name' => 'Docker', 'category' => 'DevOps', 'level' => 80, 'years_of_experience' => 3, 'sort_order' => 1, 'icon_name' => 'docker']);
        $gitSkill = Skill::create(['name' => 'Git & GitHub', 'category' => 'DevOps', 'level' => 90, 'years_of_experience' => 5, 'sort_order' => 2, 'icon_name' => 'git-branch']);

        // 6. Projects
        $p1 = Project::create([
            'title' => 'Smart Payment Platform',
            'slug' => 'smart-payment-platform',
            'short_description' => 'Plateforme de paiement sécurisée permettant de gérer les transactions et wallets en temps réel.',
            'full_description' => "Smart Payment est une plateforme de paiement complète conçue avec Laravel et React. Elle offre une interface intuitive pour la gestion de transactions financières, de wallets multi-devises, avec une sécurité maximale certifiée PCI-DSS. Le backend expose une API REST performante intégrant de nombreuses validations, tandis que le frontend propose des graphiques interactifs de suivi.",
            'main_image_url' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
            'category_id' => $webCat->id,
            'status' => 'published',
            'is_featured' => true,
            'github_url' => 'https://github.com/jeanpaul/smart-payment',
            'demo_url' => 'https://demo.smart-payment.com',
            'project_date' => '2025-06-15',
        ]);
        $p1->skills()->attach([$laravelSkill->id, $reactSkill->id, $tsSkill->id, $postgresSkill->id]);

        $p2 = Project::create([
            'title' => 'E-Commerce Mobile Companion',
            'slug' => 'e-commerce-mobile-companion',
            'short_description' => 'Application mobile compagnon pour boutique en ligne, développée en React Native.',
            'full_description' => "Une application mobile moderne qui permet aux utilisateurs de parcourir le catalogue de produits, d'ajouter des articles au panier et de passer commande avec notifications push en temps réel. Intègre les services de géolocalisation et Stripe.",
            'main_image_url' => 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80',
            'category_id' => $mobileCat->id,
            'status' => 'published',
            'is_featured' => false,
            'github_url' => 'https://github.com/jeanpaul/mobile-shop',
            'demo_url' => null,
            'project_date' => '2024-11-20',
        ]);
        $p2->skills()->attach([$reactSkill->id, $tsSkill->id, $nodeSkill->id]);

        $p3 = Project::create([
            'title' => 'Portfolio & CMS Platform',
            'slug' => 'portfolio-cms-platform',
            'short_description' => 'Ce portfolio professionnel moderne, entièrement administrable et propulsé par Laravel et React.',
            'full_description' => "Développement de l'application web complète de portfolio professionnel dotée d'un CMS d'administration complet. Gestion dynamique du profil, des projets, des articles de blog (Markdown), de la boîte de réception des messages, et des analytics intégrés avec graphiques de trafic.",
            'main_image_url' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
            'category_id' => $webCat->id,
            'status' => 'published',
            'is_featured' => true,
            'github_url' => 'https://github.com/jeanpaul/portfolio',
            'demo_url' => 'https://jeanpaul.dev',
            'project_date' => '2026-08-01',
        ]);
        $p3->skills()->attach([$laravelSkill->id, $reactSkill->id, $tsSkill->id, $postgresSkill->id, $dockerSkill->id, $tailwindSkill->id]);

        // Project Gallery Images
        ProjectImage::create(['project_id' => $p1->id, 'url' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80', 'sort_order' => 1]);
        ProjectImage::create(['project_id' => $p3->id, 'url' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', 'sort_order' => 1]);

        // 7. Experiences
        Experience::create([
            'company' => 'TechCorp Solutions',
            'position' => 'Développeur Full-Stack Senior',
            'description' => "Architecture et développement de microservices backend sous Laravel. Optimisation des performances des bases de données SQL. Conception de dashboards d'administration complexes sous React.",
            'start_date' => '2024-03-01',
            'end_date' => null,
            'location' => 'Paris (Hybride)',
            'technologies' => 'Laravel, React, PostgreSQL, Docker, AWS',
            'link' => 'https://techcorp.example.com',
        ]);
        Experience::create([
            'company' => 'WebAgency SAS',
            'position' => 'Développeur PHP / JavaScript',
            'description' => "Création de sites e-commerce et d'applications métier pour divers clients. Intégration de solutions de paiement et d'API tierces. Refactoring et écriture de tests unitaires.",
            'start_date' => '2021-09-01',
            'end_date' => '2024-02-28',
            'location' => 'Lyon, France',
            'technologies' => 'PHP, Laravel, Symfony, Vue.js, MySQL',
            'link' => 'https://webagency.example.com',
        ]);

        // 8. Educations
        Education::create([
            'institution' => 'École Supérieure du Numérique',
            'degree' => 'Master en Ingénierie Logicielle',
            'field_of_study' => 'Informatique',
            'start_date' => '2019-09-01',
            'end_date' => '2021-09-01',
            'description' => 'Spécialisation en architecture logicielle, conception de bases de données, sécurité des applications et gestion de projet Agile.',
            'status' => 'completed',
        ]);
        Education::create([
            'institution' => 'Université des Sciences',
            'degree' => 'Licence en Informatique',
            'field_of_study' => 'Sciences Informatiques',
            'start_date' => '2016-09-01',
            'end_date' => '2019-06-30',
            'description' => 'Algorithmique, Structures de données, Réseaux, Programmation Orientée Objet (C++, Java, PHP).',
            'status' => 'completed',
        ]);

        // 9. Certifications
        Certification::create([
            'name' => 'Laravel Certified Developer',
            'organization' => 'Laravel LLC',
            'issue_date' => '2023-05-12',
            'credential_id' => 'LC-8293-19',
            'credential_url' => 'https://certification.laravel.com/verify/LC-8293-19',
            'image_url' => 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80',
        ]);
        Certification::create([
            'name' => 'AWS Certified Developer - Associate',
            'organization' => 'Amazon Web Services (AWS)',
            'issue_date' => '2024-08-15',
            'credential_id' => 'AWS-DEV-2024',
            'credential_url' => 'https://aws.amazon.com/verification',
            'image_url' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
        ]);

        // 10. Post Categories
        $tutorialsCat = PostCategory::create(['name' => 'Tutoriels', 'slug' => 'tutoriels']);
        $architectureCat = PostCategory::create(['name' => 'Architecture', 'slug' => 'architecture']);

        // 11. Tags
        $reactTag = Tag::create(['name' => 'React', 'slug' => 'react']);
        $laravelTag = Tag::create(['name' => 'Laravel', 'slug' => 'laravel']);
        $securityTag = Tag::create(['name' => 'Sécurité', 'slug' => 'securite']);

        // 12. Posts
        $post1 = Post::create([
            'title' => 'Sécuriser ses API Laravel avec Sanctum',
            'slug' => 'securiser-api-laravel-sanctum',
            'summary' => "Découvrez comment mettre en place une authentification robuste pour votre API Laravel à l'aide de Laravel Sanctum, étape par étape.",
            'content' => "Laravel Sanctum fournit un système d'authentification ultra-léger pour les SPA (Single Page Applications), les applications mobiles et les API simples basées sur des jetons. Dans ce tutoriel, nous allons voir comment configurer Sanctum dans une application Laravel moderne, créer des routes d'authentification sécurisées, et consommer ces routes depuis un frontend React.\n\n### 1. Installation de Sanctum\nSanctum est généralement préinstallé dans Laravel 11. Si ce n'est pas le cas, vous pouvez l'ajouter via Composer :\n```bash\ncomposer require laravel/sanctum\n```\n\n### 2. Configuration du Middleware\nAssurez-vous que le middleware de Sanctum est configuré dans le fichier de bootstrap de l'application.",
            'cover_image_url' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
            'category_id' => $tutorialsCat->id,
            'status' => 'published',
            'reading_time' => 5,
            'published_at' => now(),
        ]);
        $post1->tags()->attach([$laravelTag->id, $securityTag->id]);

        $post2 = Post::create([
            'title' => 'Introduction à React 19 et Tailwind CSS v4',
            'slug' => 'intro-react-19-tailwind-v4',
            'summary' => 'Un aperçu des nouveautés majeures de React 19 et comment configurer le tout nouveau compilateur Tailwind CSS v4.',
            'content' => "React 19 et Tailwind CSS v4 apportent des changements majeurs dans la manière dont nous construisons nos interfaces web. Fini le PostCSS lourd à configurer, Tailwind v4 s'intègre désormais directement comme plugin Vite. Dans cet article, nous explorerons les hooks `useActionState` de React et la rapidité du moteur de rendu CSS v4.",
            'cover_image_url' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
            'category_id' => $tutorialsCat->id,
            'status' => 'published',
            'reading_time' => 4,
            'published_at' => now(),
        ]);
        $post2->tags()->attach([$reactTag->id]);

        // 13. Messages
        Message::create([
            'name' => 'Alice Martin',
            'email' => 'alice@example.com',
            'subject' => 'Proposition de projet Web',
            'message' => "Bonjour Jean Paul, nous recherchons un développeur senior pour la refonte complète de notre portail client sous Laravel et React. Seriez-vous disponible dans les prochaines semaines pour en discuter ?",
            'is_read' => false,
        ]);
        Message::create([
            'name' => 'Luc Bertrand',
            'email' => 'luc@techrecruiters.com',
            'subject' => 'Opportunité CDI - Tech Lead',
            'message' => "Bonjour Jean Paul, votre profil de développeur full-stack a retenu toute notre attention. Nous avons une opportunité en CDI pour un poste de Tech Lead. Seriez-vous ouvert à de nouvelles opportunités ?",
            'is_read' => true,
        ]);

        // 14. Settings
        Setting::set('project_views_count', '1420');
        Setting::set('cv_downloads_count', '85');
        Setting::set('personal_projects_count', '12');
        Setting::set('years_experience_count', '5');
    }
}

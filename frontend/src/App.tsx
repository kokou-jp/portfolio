import { Routes, Route } from 'react-router-dom'
import { usePageTracking } from '@/hooks/use-page-tracking'
import { AuthProvider } from '@/hooks/use-auth'
import { ToastProvider } from '@/hooks/use-toast'
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'
import HomePage from '@/pages/HomePage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import ArticlesPage from '@/pages/ArticlesPage'
import ArticleDetailPage from '@/pages/ArticleDetailPage'
import ContactPage from '@/pages/ContactPage'
import MediaPage from '@/pages/MediaPage'
import MediaDetailPage from '@/pages/MediaDetailPage'
import CertificationsPage from '@/pages/CertificationsPage'
import CertificationDetailPage from '@/pages/CertificationDetailPage'
import EducationsPage from '@/pages/EducationsPage'
import EducationDetailPage from '@/pages/EducationDetailPage'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import AdminRoute from '@/components/AdminRoute'
import NotFoundPage from '@/pages/NotFoundPage'
import ProjectsAdminPage from '@/pages/admin/ProjectsAdminPage'
import ProjectDetailAdminPage from '@/pages/admin/ProjectDetailAdminPage'
import PostsAdminPage from '@/pages/admin/PostsAdminPage'
import PostDetailAdminPage from '@/pages/admin/PostDetailAdminPage'
import SkillsAdminPage from '@/pages/admin/SkillsAdminPage'
import SkillDetailAdminPage from '@/pages/admin/SkillDetailAdminPage'
import ExperiencesAdminPage from '@/pages/admin/ExperiencesAdminPage'
import ExperienceDetailAdminPage from '@/pages/admin/ExperienceDetailAdminPage'
import EducationsAdminPage from '@/pages/admin/EducationsAdminPage'
import EducationDetailAdminPage from '@/pages/admin/EducationDetailAdminPage'
import CertificationsAdminPage from '@/pages/admin/CertificationsAdminPage'
import CertificationDetailAdminPage from '@/pages/admin/CertificationDetailAdminPage'
import MessagesAdminPage from '@/pages/admin/MessagesAdminPage'
import MessageDetailPage from '@/pages/admin/MessageDetailPage'
import MediaAdminPage from '@/pages/admin/MediaAdminPage'
import CvAdminPage from '@/pages/admin/CvAdminPage'
import ProfileAdminPage from '@/pages/admin/ProfileAdminPage'
import SettingsAdminPage from '@/pages/admin/SettingsAdminPage'

function App() {
  usePageTracking()

  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:slug" element={<ArticleDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/media/:id" element={<MediaDetailPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/certifications/:id" element={<CertificationDetailPage />} />
            <Route path="/educations" element={<EducationsPage />} />
            <Route path="/educations/:id" element={<EducationDetailPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/profile" element={<ProfileAdminPage />} />
            <Route path="/admin/projects" element={<ProjectsAdminPage />} />
            <Route path="/admin/projects/:id" element={<ProjectDetailAdminPage />} />
            <Route path="/admin/skills" element={<SkillsAdminPage />} />
            <Route path="/admin/skills/:id" element={<SkillDetailAdminPage />} />
            <Route path="/admin/experiences" element={<ExperiencesAdminPage />} />
            <Route path="/admin/experiences/:id" element={<ExperienceDetailAdminPage />} />
            <Route path="/admin/educations" element={<EducationsAdminPage />} />
            <Route path="/admin/educations/:id" element={<EducationDetailAdminPage />} />
            <Route path="/admin/certifications" element={<CertificationsAdminPage />} />
            <Route path="/admin/certifications/:id" element={<CertificationDetailAdminPage />} />
            <Route path="/admin/posts" element={<PostsAdminPage />} />
            <Route path="/admin/posts/:id" element={<PostDetailAdminPage />} />
            <Route path="/admin/messages" element={<MessagesAdminPage />} />
            <Route path="/admin/messages/:id" element={<MessageDetailPage />} />
            <Route path="/admin/media" element={<MediaAdminPage />} />
            <Route path="/admin/cv" element={<CvAdminPage />} />
            <Route path="/admin/settings" element={<SettingsAdminPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App

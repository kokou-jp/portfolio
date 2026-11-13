import { api } from '@/lib/api';
import type {
  ApiResponse,
  PaginatedResponse,
  Profile,
  SocialLink,
  Project,
  Category,
  Skill,
  Experience,
  Education,
  Certification,
  Post,
  PostCategory,
  Message,
  CvFile,
  User,
  LoginResponse,
  DashboardStats,
  VisitData,
  PopularItem,
} from '@/types';

// ==========================================
// Auth Services
// ==========================================

export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>('/login', { email, password }),

  logout: () => api.post('/logout', {}, true),

  me: () => api.get<ApiResponse<User>>('/me', true),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post(
      '/change-password',
      {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword,
      },
      true
    ),

  forgotPassword: (email: string) => api.post('/forgot-password', { email }),
};

// ==========================================
// Profile Services
// ==========================================

export const profileService = {
  getPublicProfile: () => api.get<ApiResponse<Profile>>('/profile'),
  getSocialLinks: () => api.get<ApiResponse<SocialLink[]>>('/social-links'),
  getAdminProfile: () => api.get<ApiResponse<Profile>>('/admin/profile', true),
  updateProfile: (data: Partial<Profile>) =>
    api.put<ApiResponse<Profile>>('/admin/profile', data, true),
  updateSocialLinks: (links: Partial<SocialLink>[]) =>
    api.put<ApiResponse<Profile>>('/admin/profile/social-links', { links }, true),
};

// ==========================================
// Project Services
// ==========================================

export const projectService = {
  getAdminProjectDetail: (id: string) => api.get<ApiResponse<Project>>(`/admin/projects/${id}`),
  getProjects: (params?: Record<string, string>) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return api.get<ApiResponse<PaginatedResponse<Project>>>(`/projects${queryString ? `?${queryString}` : ''}`);
  },
  getProject: (slug: string) => api.get<ApiResponse<Project>>(`/projects/${slug}`),
  getCategories: () => api.get<ApiResponse<Category[]>>('/categories'),
  getAdminProjects: () => api.get<ApiResponse<PaginatedResponse<Project>>>('/admin/projects', true),
  getAdminProject: (id: string) => api.get<ApiResponse<Project>>(`/admin/projects/${id}/edit`, true),
  createProject: (data: unknown) => api.post<ApiResponse<Project>>('/admin/projects', data, true),
  updateProject: (id: string, data: unknown) => api.put<ApiResponse<Project>>(`/admin/projects/${id}`, data, true),
  deleteProject: (id: string) => api.delete<ApiResponse<null>>(`/admin/projects/${id}`, true),
};

// ==========================================
// Skills Services
// ==========================================

export const skillService = {
  getSkill: (id: string) => api.get<ApiResponse<Skill>>(`/admin/skills/${id}`, true),
  getSkills: () => api.get<ApiResponse<Skill[]>>('/skills'),
  createSkill: (data: unknown) => api.post<ApiResponse<Skill>>('/admin/skills', data, true),
  updateSkill: (id: string, data: unknown) => api.put<ApiResponse<Skill>>(`/admin/skills/${id}`, data, true),
  deleteSkill: (id: string) => api.delete<ApiResponse<null>>(`/admin/skills/${id}`, true),
};

// ==========================================
// Experience Services
// ==========================================

export const experienceService = {
  getExperience: (id: string) => api.get<ApiResponse<Experience>>(`/admin/experiences/${id}`),
  getExperiences: () => api.get<ApiResponse<Experience[]>>('/experiences'),
  createExperience: (data: unknown) => api.post<ApiResponse<Experience>>('/admin/experiences', data, true),
  updateExperience: (id: string, data: unknown) => api.put<ApiResponse<Experience>>(`/admin/experiences/${id}`, data, true),
  deleteExperience: (id: string) => api.delete<ApiResponse<null>>(`/admin/experiences/${id}`, true),
};

// ==========================================
// Education Services
// ==========================================

export const educationService = {
  getEducation: (id: string) => api.get<ApiResponse<Education>>(`/educations/${id}`),
  getEducations: () => api.get<ApiResponse<Education[]>>('/educations'),
  createEducation: (data: unknown) => api.post<ApiResponse<Education>>('/admin/educations', data, true),
  updateEducation: (id: string, data: unknown) => api.put<ApiResponse<Education>>(`/admin/educations/${id}`, data, true),
  deleteEducation: (id: string) => api.delete<ApiResponse<null>>(`/admin/educations/${id}`, true),
};

// ==========================================
// Certification Services
// ==========================================

export const certificationService = {
  getCertification: (id: string) => api.get<ApiResponse<Certification>>(`/certifications/${id}`),
  getCertifications: () => api.get<ApiResponse<Certification[]>>('/certifications'),
  createCertification: (data: unknown) => api.post<ApiResponse<Certification>>('/admin/certifications', data, true),
  updateCertification: (id: string, data: unknown) => api.put<ApiResponse<Certification>>(`/admin/certifications/${id}`, data, true),
  deleteCertification: (id: string) => api.delete<ApiResponse<null>>(`/admin/certifications/${id}`, true),
};

// ==========================================
// Timeline Services (combined experience, education, certification)
// ==========================================

export const timelineService = {
  getExperiences: () => api.get<ApiResponse<Experience[]>>('/experiences'),
  getExperience: (id: string) => api.get<ApiResponse<Experience>>(`/admin/experiences/${id}`, true),
  getEducations: () => api.get<ApiResponse<Education[]>>('/educations'),
  getEducation: (id: string) => api.get<ApiResponse<Education>>(`/educations/${id}`),
  getCertifications: () => api.get<ApiResponse<Certification[]>>('/certifications'),
  getCertification: (id: string) => api.get<ApiResponse<Certification>>(`/certifications/${id}`),
  createSkill: (data: unknown) => api.post<ApiResponse<Skill>>('/admin/skills', data, true),
  updateSkill: (id: string, data: unknown) => api.put<ApiResponse<Skill>>(`/admin/skills/${id}`, data, true),
  deleteSkill: (id: string) => api.delete<ApiResponse<null>>(`/admin/skills/${id}`, true),
  createExperience: (data: unknown) => api.post<ApiResponse<Experience>>('/admin/experiences', data, true),
  updateExperience: (id: string, data: unknown) => api.put<ApiResponse<Experience>>(`/admin/experiences/${id}`, data, true),
  deleteExperience: (id: string) => api.delete<ApiResponse<null>>(`/admin/experiences/${id}`, true),
  createEducation: (data: unknown) => api.post<ApiResponse<Education>>('/admin/educations', data, true),
  updateEducation: (id: string, data: unknown) => api.put<ApiResponse<Education>>(`/admin/educations/${id}`, data, true),
  deleteEducation: (id: string) => api.delete<ApiResponse<null>>(`/admin/educations/${id}`, true),
  createCertification: (data: unknown) => api.post<ApiResponse<Certification>>('/admin/certifications', data, true),
  updateCertification: (id: string, data: unknown) => api.put<ApiResponse<Certification>>(`/admin/certifications/${id}`, data, true),
  deleteCertification: (id: string) => api.delete<ApiResponse<null>>(`/admin/certifications/${id}`, true),
};

// ==========================================
// Post Services
// ==========================================

export const postService = {
  getAdminPostDetail: (id: string) => api.get<ApiResponse<Post>>(`/admin/posts/${id}`),
  getPosts: (params?: { category?: string; tag?: string; search?: string }) => {
    const queryString = new URLSearchParams(params || {});
    const qs = queryString.toString();
    return api.get<ApiResponse<PaginatedResponse<Post>>>(`/posts${qs ? `?${qs}` : ''}`);
  },
  getPost: (slug: string) => api.get<ApiResponse<Post>>(`/posts/${slug}`),
  getCategories: () => api.get<ApiResponse<PostCategory[]>>('/post-categories'),
  getAdminPosts: () => api.get<ApiResponse<PaginatedResponse<Post>>>('/admin/posts', true),
  getAdminPost: (id: string) => api.get<ApiResponse<Post>>(`/admin/posts/${id}/edit`, true),
  createPost: (data: unknown) => api.post<ApiResponse<Post>>('/admin/posts', data, true),
  updatePost: (id: string, data: unknown) => api.put<ApiResponse<Post>>(`/admin/posts/${id}`, data, true),
  deletePost: (id: string) => api.delete<ApiResponse<null>>(`/admin/posts/${id}`, true),
};

// ==========================================
// Contact Services
// ==========================================

export const contactService = {
  sendMessage: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post<ApiResponse<Message>>('/contact', data),
  getMessages: () => api.get<ApiResponse<PaginatedResponse<Message>>>('/admin/messages', true),
  getMessage: (id: string) => api.get<ApiResponse<Message>>(`/admin/messages/${id}`, true),
  getUnreadCount: () =>
    api.get<ApiResponse<{ unread_count: number }>>('/admin/messages/unread-count', true),
  toggleRead: (id: string) => api.put<ApiResponse<Message>>(`/admin/messages/${id}/read`, {}, true),
  deleteMessage: (id: string) => api.delete<ApiResponse<null>>(`/admin/messages/${id}`, true),
};

// ==========================================
// Media Services
// ==========================================

export const mediaService = {
  getMedia: () => api.get<ApiResponse<PaginatedResponse<import('@/types').Media>>>('/admin/media', true),
  getPublicMedia: () => api.get<ApiResponse<PaginatedResponse<import('@/types').Media>>>('/media'),
  getPublicMediaDetail: (id: string) => api.get<ApiResponse<import('@/types').Media>>(`/media/${id}`),
  upload: (formData: FormData) => {
    return fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    }).then((res) => res.json());
  },
  delete: (id: string) => api.delete<ApiResponse<null>>(`/admin/media/${id}`, true),
};

// ==========================================
// CV Services
// ==========================================

export const cvService = {
  getActive: () => api.get<ApiResponse<CvFile>>('/cv'),
  download: () => api.get<ApiResponse<{ url: string; download_count: number }>>('/cv/download'),
  getAdminCVs: () => api.get<ApiResponse<CvFile[]>>('/admin/cv', true),
  upload: (formData: FormData) => {
    return fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/cv/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    }).then((res) => res.json());
  },
  update: (id: string, data: { version?: string; status?: 'draft' | 'published'; is_active?: boolean }) =>
    api.put<ApiResponse<CvFile>>(`/admin/cv/${id}`, data, true),
  activate: (id: string) => api.post<ApiResponse<CvFile>>(`/admin/cv/${id}/activate`, {}, true),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/admin/cv/${id}`, true),
};

// ==========================================
// Dashboard Services
// ==========================================

export const dashboardService = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats', true),
  getVisits: (period = '30_days') =>
    api.get<ApiResponse<VisitData[]>>(`/admin/dashboard/visits?period=${period}`, true),
  getPopularProjects: () =>
    api.get<ApiResponse<PopularItem[]>>('/admin/dashboard/popular-projects', true),
  getPopularPosts: () =>
    api.get<ApiResponse<PopularItem[]>>('/admin/dashboard/popular-posts', true),
};

// ==========================================
// Settings Services
// ==========================================

export const settingsService = {
  getSettings: () => api.get<ApiResponse<Record<string, string>>>('/admin/settings', true),
  getPublicStats: () => api.get<ApiResponse<Record<string, string>>>('/settings/stats'),
  updateSettings: (settings: Record<string, string>) =>
    api.put<ApiResponse<Record<string, string>>>('/admin/settings', { settings }, true),
};






// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// ==========================================
// Profile Types
// ==========================================

export interface Profile {
  id: string;
  user_id: string;
  title: string;
  bio: string;
  location: string;
  availability_status: string;
  phone: string;
  avatar_url: string;
  long_bio: string;
  social_links?: SocialLink[];
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

// ==========================================
// Project Types
// ==========================================

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string | null;
  main_image_url: string | null;
  category_id: string | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  github_url: string | null;
  demo_url: string | null;
  project_date: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  skills?: Skill[];
  images?: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  projects_count?: number;
}

// ==========================================
// Skill Types
// ==========================================

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  years_of_experience: number | null;
  sort_order: number;
  icon_name: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Experience Types
// ==========================================

export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  technologies: string | null;
  link: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Education Types
// ==========================================

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_date: string;
  end_date: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Certification Types
// ==========================================

export interface Certification {
  id: string;
  name: string;
  organization: string;
  issue_date: string;
  credential_id: string | null;
  credential_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Post / Blog Types
// ==========================================

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  cover_image_url: string | null;
  category_id: string | null;
  status: 'draft' | 'published';
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: PostCategory | null;
  tags?: Tag[];
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  posts_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

// ==========================================
// Message Types
// ==========================================

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Media Types
// ==========================================

export interface Media {
  id: string;
  filename: string;
  path: string;
  url: string;
  mime_type: string;
  file_size: number;
  type: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// CV Types
// ==========================================

export interface CvFile {
  id: string;
  version: string | null;
  file_path: string;
  url: string;
  is_active: boolean;
  status?: 'draft' | 'published';
  download_count: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Dashboard Types
// ==========================================

export interface DashboardStats {
  projects_count: number;
  posts_count: number;
  skills_count: number;
  messages_count: number;
  unread_messages_count: number;
  cv_downloads: number;
  today_visits: number;
  week_visits: number;
  month_visits: number;
  total_visits: number;
}

export interface VisitData {
  label: string;
  date?: string;
  count: number;
}

export interface PopularItem {
  trackable_id: string;
  views_count: string;
  title: string;
  slug: string | null;
}

// ==========================================
// Auth Types
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
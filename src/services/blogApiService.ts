import { apiClient } from "./api.client";

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
  hero_image_url: string | null;
  published_at: string;
  meta_title: string | null;
  target_keywords: string[] | null;
    already_logged: boolean;

}

export interface BlogImage {
  id: string;
  image_type: "hero" | "inline";
  s3_url: string;
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
}

export interface BlogPostDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
  images: BlogImage[];
  meta_title: string | null;
  meta_description: string | null;
  target_keywords: string[] | null;
  twitter_snippet: string | null;
  linkedin_snippet: string | null;
  research_sources: { title: string; url: string; source: string; snippet: string }[] | null;
  related_post_ids: string[] | null;
  published_at: string;
  created_at: string;
  generation_duration_ms: number | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogPostSummary[];
  meta: { total: number; page: number; limit: number };
}

export interface BlogDetailResponse {
  success: boolean;
  data: BlogPostDetail;
}

class BlogApiService {
  async getPosts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<BlogListResponse> {
    await apiClient.wakeUpService();

    let url = `/blog/posts?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;

    return apiClient.fetch<BlogListResponse>(url);
  }

  async getPostById(id: string): Promise<BlogDetailResponse> {
    return apiClient.fetch<BlogDetailResponse>(`/blog/posts/${id}`);
  }

  async updatePostLoggedStatus(id: string, alreadyLogged: boolean): Promise<{ success: boolean; message: string }> {
    return apiClient.fetch<{ success: boolean; message: string }>(`/blog/posts/${id}/logged`, {
      method: 'PUT',
      body: JSON.stringify({ already_logged: alreadyLogged }),
    });
  }

  async getCategories(): Promise<{ success: boolean; data: BlogCategory[] }> {
    return apiClient.fetch<{ success: boolean; data: BlogCategory[] }>("/blog/categories");
  }
}

export const blogApiService = new BlogApiService();

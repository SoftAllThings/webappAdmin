import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  TextField,
  Box,
  CircularProgress,
  Pagination,
  Alert,
} from "@mui/material";
import BlogPostCard from "./BlogPostCard";
import { blogApiService, BlogPostSummary } from "../../services/blogApiService";

interface BlogPostsListProps {
  onSelectPost: (id: string) => void;
}

const POSTS_PER_PAGE = 9;

const BlogPostsList: React.FC<BlogPostsListProps> = ({ onSelectPost }) => {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogApiService.getPosts(
        page,
        POSTS_PER_PAGE,
        search || undefined
      );
      setPosts(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Blog Posts
        </Typography>
        <TextField
          size="small"
          placeholder="Search posts..."
          value={search}
          onChange={handleSearchChange}
          sx={{ width: 250 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary">
            {search ? "No posts found matching your search." : "No blog posts yet. The agent will generate the first one on its next run."}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <BlogPostCard post={post} onClick={onSelectPost} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default BlogPostsList;

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ArrowBack, ContentCopy } from "@mui/icons-material";
import {
  blogApiService,
  BlogPostDetail as BlogPostDetailType,
} from "../../services/blogApiService";

interface BlogPostDetailProps {
  postId: string;
  onBack: () => void;
}

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ postId, onBack }) => {
  const [post, setPost] = useState<BlogPostDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await blogApiService.getPostById(postId);
        setPost(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
          Back to Posts
        </Button>
        <Alert severity="error">{error || "Post not found"}</Alert>
      </Box>
    );
  }

  const heroImage = post.images.find((img) => img.image_type === "hero");
  const formattedDate = new Date(post.published_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
        Back to Posts
      </Button>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {heroImage && (
            <Box
              component="img"
              src={heroImage.s3_url}
              alt={heroImage.alt_text || post.title}
              sx={{
                width: "100%",
                maxHeight: 400,
                objectFit: "cover",
                borderRadius: 2,
                mb: 2,
              }}
            />
          )}

          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            {post.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
            {post.category && (
              <Chip label={post.category.name} size="small" color="primary" />
            )}
            {post.tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
              sx={{
                "& h1": { fontSize: "1.8rem", fontWeight: 700, mb: 2, mt: 3 },
                "& h2": { fontSize: "1.4rem", fontWeight: 600, mb: 1.5, mt: 3 },
                "& p": { mb: 1.5, lineHeight: 1.7 },
                "& ul, & ol": { mb: 1.5, pl: 3 },
                "& li": { mb: 0.5 },
                "& blockquote": {
                  borderLeft: 3,
                  borderColor: "primary.main",
                  pl: 2,
                  ml: 0,
                  fontStyle: "italic",
                  color: "text.secondary",
                },
                "& figure": { my: 3, textAlign: "center" },
                "& figure img": { maxWidth: "100%", borderRadius: 1 },
                "& figcaption": {
                  mt: 1,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                },
                "& aside.key-takeaways": {
                  bgcolor: "action.hover",
                  p: 2,
                  borderRadius: 1,
                  my: 3,
                },
                "& a": { color: "primary.main" },
              }}
            />
          </Paper>
        </Box>

        {/* Metadata Sidebar */}
        <Box sx={{ width: { xs: "100%", lg: 340 }, flexShrink: 0 }}>
          {/* SEO */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              SEO Metadata
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Meta Title
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {post.meta_title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Meta Description
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {post.meta_description}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Keywords
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
              {post.target_keywords?.map((kw, i) => (
                <Chip key={i} label={kw} size="small" variant="outlined" />
              ))}
            </Box>
          </Paper>

          {/* Social Snippets */}
          {(post.twitter_snippet || post.linkedin_snippet) && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Social Snippets
              </Typography>
              {post.twitter_snippet && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Twitter / X
                    </Typography>
                    <Tooltip
                      title={copiedField === "twitter" ? "Copied!" : "Copy"}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          copyToClipboard(post.twitter_snippet!, "twitter")
                        }
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      bgcolor: "action.hover",
                      p: 1,
                      borderRadius: 1,
                      fontSize: "0.8rem",
                    }}
                  >
                    {post.twitter_snippet}
                  </Typography>
                </Box>
              )}
              {post.linkedin_snippet && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      LinkedIn
                    </Typography>
                    <Tooltip
                      title={copiedField === "linkedin" ? "Copied!" : "Copy"}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          copyToClipboard(post.linkedin_snippet!, "linkedin")
                        }
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      bgcolor: "action.hover",
                      p: 1,
                      borderRadius: 1,
                      fontSize: "0.8rem",
                    }}
                  >
                    {post.linkedin_snippet}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* HTML Copy */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Raw HTML
              </Typography>
              <Tooltip title={copiedField === "html" ? "Copied!" : "Copy HTML"}>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(post.content_html, "html")}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Copy the raw HTML to paste into Squarespace
            </Typography>
          </Paper>

          {/* Research Sources */}
          {post.research_sources && post.research_sources.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Research Sources
              </Typography>
              {post.research_sources.map((source, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    component="a"
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {source.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {source.source}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}

          {/* Pipeline Info */}
          {post.generation_duration_ms && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Generation Info
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generated in {(post.generation_duration_ms / 1000).toFixed(1)}s
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BlogPostDetail;

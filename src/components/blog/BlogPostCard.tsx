import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  CardActionArea,
} from "@mui/material";
import { BlogPostSummary } from "../../services/blogApiService";

interface BlogPostCardProps {
  post: BlogPostSummary;
  onClick: (id: string) => void;
  markPosted: (id: string) => void;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, onClick, markPosted}) => {

  const formattedDate = new Date(post.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (<>
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={() => onClick(post.id)} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          height="180"
          image={post.hero_image_url || "https://via.placeholder.com/400x180?text=No+Image"}
          alt={post.title}
          sx={{ objectFit: "cover" }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formattedDate}
          </Typography>
          <Typography variant="h6" component="h2" sx={{ mt: 0.5, mb: 1, lineHeight: 1.3 }}>
            {post.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {post.category && (
              <Chip label={post.category.name} size="small" color="primary" variant="outlined" />
            )}
            {post.tags.slice(0, 3).map((tag) => (
              <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
            ))}
          </Box>
          <Box>

          </Box>
          
        </CardContent>

      </CardActionArea>
      <button onClick= {() => markPosted(post.id)}>{!post.already_logged? "Mark as Posted" : "Set as Unposted"}</button>
    </Card>
   
    </>
  );
};

export default BlogPostCard;

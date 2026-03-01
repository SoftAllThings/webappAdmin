import React, { useState } from "react";
import { Box } from "@mui/material";
import BlogPostsList from "../blog/BlogPostsList";
import BlogPostDetail from "../blog/BlogPostDetail";

const BlogView: React.FC = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  return (
    <Box sx={{ p: 3 }}>
      {selectedPostId ? (
        <BlogPostDetail
          postId={selectedPostId}
          onBack={() => setSelectedPostId(null)}
        />
      ) : (
        <BlogPostsList onSelectPost={(id) => setSelectedPostId(id)} />
      )}
    </Box>
  );
};

export default BlogView;

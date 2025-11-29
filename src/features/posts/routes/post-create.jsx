import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import PostForm from "@/features/posts/components/post-form.jsx";
import { createPost } from "@/features/posts/api/post-api";
import { useImageUpload } from "@/shared/hooks/use-image-upload.js";

const PostCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { previewUrl, handleFileChange, upload } = useImageUpload("");

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const { title, content } = formData;
      
      const uploadedUrl = await upload();

      return createPost({
        title,
        content,
        postImageUrl: uploadedUrl || null,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      navigate("/posts");
    },
    onError: (error) => {
      console.error(error);
      alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleCreateSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  return (
    <div className="page-post-form">
      <div className="spacer-lg">
        <PostForm
          onSubmit={handleCreateSubmit}
          isEditMode={false}
          previewUrl={previewUrl}
          onImageChange={handleFileChange}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
};

export default PostCreate;

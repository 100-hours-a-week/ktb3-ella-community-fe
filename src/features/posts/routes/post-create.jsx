import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PostForm from "@/features/posts/components/post-form.jsx";
import { createPost } from "@/features/posts/api/post-api";
import { useImageUpload } from "@/shared/hooks/use-image-upload.js";
import { useAuthStore } from "@/shared/stores/use-auth-store";

const PostCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { previewUrl, handleFileChange, upload } = useImageUpload("");

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleCreateSubmit = async ({ title, content }) => {
    try {
      const uploadedUrl = await upload();

      await createPost({
        title,
        content,
        postImageUrl: uploadedUrl || null,
      });

      alert("게시글이 등록되었습니다.");
      navigate("/posts");
    } catch (error) {
      console.error(error);
      alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="page-post-form">
      <div className="spacer-lg">
        <PostForm
          onSubmit={handleCreateSubmit}
          isEditMode={false}
          previewUrl={previewUrl}
          onImageChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default PostCreate;

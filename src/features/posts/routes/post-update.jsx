import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostForm from "@/features/posts/components/post-form";
import { getPost, updatePost } from "@/features/posts/api/post-api";

import { useImageUpload } from "@/shared/hooks/use-image-upload.js";

const PostUpdateContainer = ({ postId, initialData }) => {
  const navigate = useNavigate();

  // 훅 초기화
  const { previewUrl, handleFileChange, upload } = useImageUpload(
    initialData.postImageUrl || ""
  );

  // 수정 제출 핸들러
  const handleUpdateSubmit = async ({ title, content }) => {
    try {
      // 이미지 업로드 실행 -> URL 반환
      const uploadedUrl = await upload();

      await updatePost(postId, {
        title,
        content,
        postImageUrl: uploadedUrl,
      });

      alert("게시글이 수정되었습니다.");
      navigate(`/posts/${postId}`);
    } catch (error) {
      console.error(error);
      alert(error.message || "게시글 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <PostForm
      initialData={initialData}
      onSubmit={handleUpdateSubmit}
      isEditMode={true}
      previewUrl={previewUrl}
      onImageChange={handleFileChange}
    />
  );
};

const PostUpdate = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 기존 데이터 불러오기
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPost(postId);
        setPost(data);
      } catch (error) {
        alert("게시글 정보를 불러올 수 없습니다.");
        navigate("/posts");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [postId, navigate]);

  if (isLoading) return <div>Loading...</div>;
  if (!post) return null;

  return (
    <div className="page-post-form">
      <div className="spacer-lg">
        <PostUpdateContainer postId={postId} initialData={post} />
      </div>
    </div>
  );
};

export default PostUpdate;

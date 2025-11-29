import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import PostForm from "@/features/posts/components/post-form";
import { getPost, updatePost } from "@/features/posts/api/post-api";
import { useImageUpload } from "@/shared/hooks/use-image-upload.js";

const PostUpdateContainer = ({ postId, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 훅 초기화
  const { previewUrl, handleFileChange, upload } = useImageUpload(
    initialData.postImageUrl || ""
  );

  const updateMutation = useMutation({
    mutationFn: async (newData) => {
      // 이미지 먼저 업로드
      const uploadedUrl = await upload();

      return updatePost(postId, {
        ...newData,
        postImageUrl: uploadedUrl,
      });
    },
    onSuccess: () => {
      // 수정 성공 시, 해당 게시글의 캐시 삭제
      queryClient.invalidateQueries(["post", postId]);

      alert("게시글이 수정되었습니다.");
      navigate(`/posts/${postId}`);
    },
    onError: (error) => {
      console.error(error);
      alert(error.message || "게시글 수정 중 오류가 발생했습니다.");
    },
  });

  // 수정 제출 핸들러
  const handleUpdateSubmit = (formData) => {
    updateMutation.mutate(formData);
  };

  return (
    <PostForm
      initialData={initialData}
      onSubmit={handleUpdateSubmit}
      isEditMode={true}
      previewUrl={previewUrl}
      onImageChange={handleFileChange}
      isLoading={updateMutation.isPending}
    />
  );
};

const PostUpdate = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    staleTime: 1000 * 60,
    retry: 0,
  });

  useEffect(() => {
    if (isError) {
      alert("게시글 정보를 불러올 수 없습니다.");
      navigate("/posts");
    }
  }, [isError, navigate]);

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

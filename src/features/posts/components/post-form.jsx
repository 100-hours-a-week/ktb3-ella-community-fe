import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "@/styles/components/post-form.css";

import { createPost, updatePost } from "@/features/posts/api/post-api";
import { useImageUpload } from "@/shared/hooks/use-image-upload.js";

const PostForm = ({ initialData = null, postId = null }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // postId가 있으면 수정 모드로 간주
  const isEditMode = !!postId;

  // 이미지 업로드 훅 (초기 이미지가 있다면 설정)
  const { previewUrl, handleFileChange, upload } = useImageUpload(
    initialData?.postImageUrl || ""
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 수정 모드일 경우 초기 데이터 세팅
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
    }
  }, [initialData]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      navigate("/posts");
    },
    onError: (error) => {
      console.error(error);
      alert("게시글 등록에 실패했습니다.");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["post", postId]); // 상세 페이지 캐시 갱신
      navigate(`/posts/${postId}`);
    },
    onError: (error) => {
      console.error(error);
      alert("게시글 수정에 실패했습니다.");
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setErrorMsg("*제목, 내용을 모두 작성해주세요.");
      return;
    }

    try {
      // 1. 이미지 업로드 수행
      const uploadedUrl = await upload();

      // 2. Payload 구성
      const payload = {
        title,
        content,
        postImageUrl: uploadedUrl, // 기존 URL 유지 or 새 URL or null
      };

      // 3. 모드에 따른 분기 처리
      if (isEditMode) {
        updateMutation.mutate({ postId, ...payload });
      } else {
        createMutation.mutate(payload);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <form
      className={isEditMode ? "post-update" : "post-create"}
      onSubmit={handleSubmit}
      noValidate
    >
      <h1 className={isEditMode ? "post-update-text" : "post-create-text"}>
        {isEditMode ? "게시글 수정" : "게시글 작성"}
      </h1>

      {/* 제목 */}
      <div className="post-label">
        <h2 className="post-label-text">제목*</h2>
      </div>
      <div className="horizontal-spacer-sm"></div>
      <input
        type="text"
        className="post-title-input"
        placeholder="제목을 입력해주세요. (최대 26글자)"
        maxLength={26}
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="horizontal-spacer-sm"></div>

      {/* 내용 */}
      <div className="post-label">
        <h2 className="post-label-text">내용*</h2>
      </div>
      <div className="horizontal-spacer-sm"></div>
      <textarea
        className="post-content-input"
        placeholder="내용을 입력해주세요."
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>

      <div className="horizontal-spacer-sm"></div>
      <p className="error-text">{errorMsg}</p>

      {/* 이미지 업로드 영역 */}
      <div className="post-label">
        <h2 className="post-label-text">이미지</h2>
      </div>
      <div className="post-image-input-container">
        <label className="btn-image-upload">
          파일 선택
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </label>
        <p className="post-image-input-text">
          {previewUrl ? "이미지가 선택되었습니다." : "파일을 선택해주세요."}
        </p>

        {/* 미리보기 이미지 */}
        {previewUrl ? (
          <img
            src={previewUrl}
            className="post-image-preview"
            alt="미리보기"
            style={{ display: "block" }}
          />
        ) : (
          <div className="post-image-preview" style={{ display: "none" }} />
        )}
      </div>

      <div className="btn-post-submit-div">
        <button
          type="submit"
          className={`btn-post-submit ${isValid ? "active" : ""}`}
          disabled={isLoading || !isValid}
        >
          {isLoading ? "처리 중..." : isEditMode ? "수정하기" : "등록하기"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;

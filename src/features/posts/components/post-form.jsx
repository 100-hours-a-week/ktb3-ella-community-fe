import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/components/post-form.css";

const PostForm = ({ 
  initialData = null, 
  onSubmit, 
  isEditMode = false,
  previewUrl, 
  onImageChange 
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
    }
  }, [initialData]);

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setErrorMsg("*제목, 내용을 모두 작성해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ title, content });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={isEditMode ? "post-update" : "post-create"} onSubmit={handleSubmit} noValidate>
      <h1 className={isEditMode ? "post-update-text" : "post-create-text"}>
        {isEditMode ? "게시글 수정" : "게시글 작성"}
      </h1>

      {/* 제목 */}
      <div className="post-label"><h2 className="post-label-text">제목*</h2></div>
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
      <div className="post-label"><h2 className="post-label-text">내용*</h2></div>
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
      <div className="post-label"><h2 className="post-label-text">이미지</h2></div>
      <div className="post-image-input-container">
        <label className="btn-image-upload">
          파일 선택
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={onImageChange} 
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
             style={{ display: 'block' }}
           />
        ) : (
          <div className="post-image-preview" style={{ display: 'none' }} />
        )}
      </div>

      <div className="btn-post-submit-div">
        <button 
          type="submit" 
          className={`btn-post-submit ${isValid ? "active" : ""}`}
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? "처리 중..." : (isEditMode ? "수정하기" : "등록하기")}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
import {
  uploadFileWithPresignedUrl,
  requestPresignedUpload,
} from "./services/upload.js";

const input = document.getElementById("image-input");
const uploadBtn = document.getElementById("upload-button");
const previewImg = document.getElementById("preview-image");

/**
 * 업로드 버튼 클릭 핸들러
 */
uploadBtn.addEventListener("click", async () => {
  const file = input.files && input.files[0];
  if (!file) {
    alert("먼저 이미지를 선택해주세요.");
    return;
  }

  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "업로드 중...";

    const presignedData = await requestPresignedUpload({ file });
    const { url, key } = await uploadFileWithPresignedUrl({
      file,
      presignedData,
    });
    previewImg.src = url;
    alert("업로드 완료!");
  } catch (e) {
    console.error(e);
    alert("업로드 중 오류 발생: " + e.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "이미지 업로드";
  }
});

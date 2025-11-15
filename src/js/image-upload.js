import { requestPresignedUploadUrl } from "./services/api.js";

const input = document.getElementById("image-input");
const uploadBtn = document.getElementById("upload-button");
const previewImg = document.getElementById("preview-image");

/**
 * 백엔드에서 presigned URL 발급받기
 * GET /uploads/presigned-url?fileName=...&contentType=...
 * 응답: ApiResult<PresignUploadResponse>
 * {
 *   success: true,
 *   data: {
 *     uploadUrl: "...",
 *     key: "images/...",
 *     headers: { "Content-Type": ["image/png"] ... }
 *   }
 * }
 */
async function getPresignedUrl(file) {
  const fileName = file.name;
  const contentType = file.type || "application/octet-stream";

  return requestPresignedUploadUrl({ fileName, contentType });
}

/**
 * presigned URL로 실제 이미지 업로드 (PUT)
 */
async function uploadToS3(uploadUrl, file, headersFromServer) {
  // 서버에서 내려준 headers는 Map<String, List<String>>라면
  // 백엔드에서 변환해줬다는 가정으로, 여기선 평범한 객체라고 보고 처리
  const extraHeaders = {};

  if (headersFromServer) {
    Object.entries(headersFromServer).forEach(([k, v]) => {
      // v가 배열이면 첫 값 사용
      if (Array.isArray(v)) {
        extraHeaders[k] = v[0];
      } else {
        extraHeaders[k] = v;
      }
    });
  }

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: extraHeaders,
    body: file,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("S3 업로드 실패: " + res.status + " " + text);
  }
}

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

    // 1) presigned URL 발급
    const { uploadUrl, key, headers } = await getPresignedUrl(file);

    // 2) S3에 PUT
    await uploadToS3(uploadUrl, file, headers);

    // 3) 업로드 성공 후, 이미지 보여주기
    //   - S3를 퍼블릭으로 열어둔 경우 (버킷 정책에서 GetObject 허용)
    //   - region / bucketName은 실제 환경에 맞게 치환
    const bucketName = "YOUR_BUCKET_NAME";
    const region = "ap-northeast-2";

    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    previewImg.src = publicUrl;

    // TODO: 여기서 key를 서버에 저장하는 API 호출 (예: 프로필 이미지 업데이트)
    // await fetch("/api/users/me/profile-image", {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ imageKey: key }),
    // });

    alert("업로드 완료!");
  } catch (e) {
    console.error(e);
    alert("업로드 중 오류 발생: " + e.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "이미지 업로드";
  }
});

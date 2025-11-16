const pad = (value) => String(value).padStart(2, "0");

// YYYY-MM-DD HH:mm:ss 형식으로 변환
export const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`
  );
};

// 숫자 단위 축약 (1200 -> 1k)
export const formatCount = (n) => {
  const num = Number(n) || 0;
  if (num >= 100000) return "100k";
  if (num >= 10000) return "10k";
  if (num >= 1000) return "1k";
  return String(num);
};

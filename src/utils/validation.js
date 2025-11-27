const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// 8~20자, 대문자/소문자/숫자/특수문자 최소 1개
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,20}$/;

const NICKNAME_PATTERN = /^[a-zA-Z0-9가-힣]{2,10}$/;

const trimValue = (value) => (value ?? "").trim();

export const validateEmail = (value) => {
  const trimmed = trimValue(value);
  if (!trimmed) return "*이메일을 입력해주세요.";
  if (!EMAIL_PATTERN.test(trimmed))
    return "*올바른 이메일 주소 형식을 입력해주세요. (예:example@example.com)";
  return "";
};

export const validatePassword = (value) => {
  const trimmed = trimValue(value);
  if (!trimmed) return "*비밀번호를 입력해주세요.";
  if (!PASSWORD_PATTERN.test(trimmed))
    return "*비밀번호는 8~20자, 대문자/소문자/숫자/특수문자를 각각 최소 1개 포함해야 합니다.";
  return "";
};

export const validateConfirmPassword = (value, original) => {
  const trimmed = trimValue(value);
  if (!trimmed) return "*비밀번호를 한번 더 입력해주세요.";
  if (trimmed !== trimValue(original)) return "*비밀번호가 일치하지 않습니다.";
  return "";
};

export const validateNickname = (value) => {
  const trimmed = trimValue(value);
  if (!trimmed) return "*닉네임을 입력해주세요.";
  if (!NICKNAME_PATTERN.test(trimmed))
    return "*닉네임은 2~10자, 공백과 특수문자 없이 입력해야 합니다.";
  return "";
};

export { EMAIL_PATTERN, PASSWORD_PATTERN, NICKNAME_PATTERN };

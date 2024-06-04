export const AUTH_EMAIL = {
  OPTION: {
    FROM: 'smtp1234@naver.com',
    SUBJECT: '인증 관련 메일입니다.',
    HTML: '인증번호를 입력해주세요',
  },
};

const VERFICATION_NUMBER = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const VERIFICATION_CODE = VERFICATION_NUMBER(111111, 999999);

export const VERIFICATION_CODES = {};
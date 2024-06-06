export const AUTH_CONSTANT = {
  // 해시에 사용한 salt
  HASH_SALT: 10,
  // 토큰 유효기간
  ACCESS_TOKEN_EXPIRED_IN: '12h',
  REFRESH_TOKEN_EXPIRED_IN: '7d',
  // 유효성 검사시 비밀번호 최소 길이
  PASSWORD_MIN_LENGTH: 6,
  // 유효성 검사시 이메일 형식
  TLDS: ['com', 'net', 'kr'],
  //유효성 검사시 최소 도메인 요소
  MIN_DOMAIN_SEGMENTS: 2,
  // 이메일 인증 관련 상수
  AUTH_EMAIL: {
    FROM: 'smtp1234@naver.com',
    SUBJECT: '인증 관련 메일입니다.',
    HTML: '인증번호를 입력해주세요',
  },
  PASSPORT: {
    COMMON: {
      FAILURE_REDIRECT: '/api/auth/fail'
    },
    KAKAO: {
      NAME: 'kakao',
      OAUTH: '/kakao/oauth'
    },
    NAVER: {
      NAME: 'naver',
      OAUTH: '/naver/oauth'
    }
  }
};

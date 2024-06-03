export const MESSAGES = {
  AUTH: {
    COMMON: {
      UNAUTHORIZED: '인증 정보가 유효하지 않습니다.',
      FORBIDDEN: '접근 권한이 없습니다.',
      JWT: {
        NO_TOKEN: '인증 정보가 없습니다.',
        NOT_SUPPORTED_TYPE: '지원하지 않는 인증 방식입니다.',
        EXPIRED: '인증 정보가 만료되었습니다.',
        NO_USER: '인증 정보와 일치하는 사용자가 없습니다.',
        INVALID: '인증 정보가 유효하지 않습니다.',
        ETC: '비정상적인 요청입니다.',
        DISCARDED_TOKEN: '폐기 된 인증 정보입니다.',
      },
    },
    MAIL: {
      SUCCEED: '메일 전송에 성공하였습니다.',
      FAIL: '메일 전송에 실패하였습니다.',
    },
  },
  USER: {
    COMMON: {
      EMAIL: {
        BASE: '이메일은 문자열이어야 합니다.',
        EMAIL: '이메일의 형식이 올바르지 않습니다',
        REQUIRED: '이메일을 입력해주세요.',
        DUPLICATED: '이미 가입 된 사용자입니다.',
      },
      PASSWORD: {
        BASE: '비밀번호는 문자열이어야 합니다.',
        REQUIRED: 'You Should have to enter the password.',
        MIN: '비밀번호는 6자리 이상이어야 합니다.',
      },
      PASSWORD_CONFIRM: {
        BASE: '비밀번호 확인은 문자열이어야 합니다.',
        REQUIRED: 'You Should have to enter the passwordCheck.',
        MIN: '비밀번호는 6자리 이상이어야 합니다.',
      },
      NICKNAME: {
        BASE: '닉네임은 문자열이어야 합니다.',
        REQUIRED: '닉네임을 입력해주세요.',
      },
      REGION: {
        BASE: '지역명은 문자열이어야 합니다.',
        REQUIRED: '지역명을 입력해주세요.',
      },
      AGE: {
        BASE: '나이는 정수를 입력해주세요.',
        REQUIRED: '나이를 입력해주세요.',
      },
      GENDER: {
        BASE: '성별은 문자열이어야 합니다.',
        REQUIRED: '성별을 입력해주세요.',
        ONLY: '성별은 [MALE, FEMALE] 중 하나여야 합니다.',
      },
    },
    SIGN_UP: {
      EMAIL: {
        DUPLICATED: 'This email or nickname are already exist.',
        INCONSISTENT: 'Passwords do not match.',
      },
      SUCCEED: 'Sign-up succeed',
    },
    SIGN_IN: {
      SUCCEED: 'Sign-in succeed',
    },
    SIGN_OUT: {
      SUCCEED: '로그아웃에 성공했습니다.',
    },
    TOKEN_REFRESH: {
      SUCCEED: '토큰 재발급에 성공하였습니다.',
    },
  },
  TRADE: {
    COMMON: {},
    CREATE: {},
    READ: {},
    UPDATE: {},
    DELETE: {},
  },
  COMMENT: {
    SIGN_IN_CHECK: {
      REQUIRED: '로그인이 필요합니다.',
    },
    LENGTH_CHECK: {
      BASE: '댓글은 1자 이상 작성해주세요.',
      REQUIRED: '댓글은 300자를 초과할 수 없습니다.',
    },
  },
};

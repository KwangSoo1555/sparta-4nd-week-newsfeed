export const MESSAGES = {
  AUTH: {
    COMMON: {
      EMAIL: {
        BASE: '이메일은 문자열이어야 합니다.',
        EMAIL: '이메일의 형식이 올바르지 않습니다',
        REQUIRED: '이메일을 입력해주세요.',
        DUPLICATED: '이미 가입 된 사용자입니다.',
      },
      PASSWORD: {
        BASE: '비밀번호는 문자열이어야 합니다.',
        REQUIRED: '비밀번호를 입력해주세요.',
        PATTERN: '비밀번호가 형식에 맞지 않습니다. (영문, 숫자, 특수문자 포함 6~15자)',
      },
      PASSWORD_CONFIRM: {
        BASE: '비밀번호 확인은 문자열이어야 합니다.',
        REQUIRED: '비밀번호 확인을 입력해주세요.',
        PATTERN: '비밀번호 확인의 형식이 맞지 않습니다. (영문, 숫자, 특수문자 포함 6~15자)',
        INCONSISTENT: '입력 한 두 비밀번호가 일치하지 않습니다.',
      },
      NICKNAME: {
        BASE: '닉네임은 문자열이어야 합니다.',
        REQUIRED: '이름을 입력해주세요.',
      },
      AGE: {
        BASE: '나이는 정수를 입력해주세요.',
        REQUIRED: '나이를 입력해주세요.',
      },
      GENDER: {
        BASE: '성별은 문자열이어야 합니다.',
        ONLY: '성별은 [MALE, FEMALE] 중 하나여야 합니다.',
      },
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
  },
  USER: {
    COMMON: {},
    SIGN_UP: {},
    SIGN_IN: {},
    SIGN_OUT: {},
    TOKEN_REFRESH: {},
  },
  TRADE: {
    COMMON: {},
    CREATE: {},
    READ: {},
    UPDATE: {},
    DELETE: {},
  },
};

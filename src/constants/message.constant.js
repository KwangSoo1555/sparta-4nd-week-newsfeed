export const MESSAGES = {
  ERROR_HANDLER: {
    MULTER: {
      PART_COUNT: '필드와 파일 수의 총합이 너무 많습니다.',
      FILE_SIZE: '파일 용량이 너무 큽니다.',
      FILE_COUNT: '파일 수가 너무 많습니다.',
      FIELD_KEY: '필드의 이름이 너무 깁니다.',
      FIELD_VALUE: '필드의 값이 너무 깁니다.',
      FIELD_COUNT: '필드가 너무 많습니다.',
      UNEXPECTED_FILE: '지원하지 않은 파일입니다.',
      FIELD_NAME: '필드의 이름을 읽어버렸습니다.',
    },
    ETC: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.',
  },
  AUTH: {
    COMMON: {
      EMAIL: {
        BASE: '이메일은 문자열입니다.',
        EMAIL: '이메일의 형식이 올바르지 않습니다',
        REQUIRED: '이메일을 입력해 주세요.',
      },
      PASSWORD: {
        BASE: '비밀번호는 문자열입니다.',
        REQUIRED: '비밀번호를 입력해 주세요.',
        MIN: '비밀번호는 6자리 이상입니다.',
        INCONSISTENT: '비밀번호가 일치하지 않습니다.',
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
    SIGN_IN: {
      SUCCEED: '로그인에 성공했습니다.',
    },
    TOKEN_REFRESH: {
      SUCCEED: '토큰 재발급에 성공했습니다.',
    },
    SIGN_OUT: {
      SUCCEED: '로그아웃에 성공했습니다.',
    },
    MAIL: {
      SUCCEED: '메일 전송에 성공했습니다.',
      FAIL: '메일 전송에 실패했습니다.',
    },
    PASSPORT: {
      COMMON: {
        FAIL: '소셜 로그인에 실패했습니다.',
      },
      KAKAO: {
        SUCCEED: '카카오 로그인에 성공했습니다.',
      },
      NAVER: {
        SUCCEED: '네이버 로그인에 성공했습니다.',
      },
    },
  },
  USER: {
    COMMON: {
      EMAIL: {
        BASE: '이메일은 문자열입니다.',
        EMAIL: '이메일의 형식이 올바르지 않습니다',
        REQUIRED: '이메일을 입력해 주세요.',
        DUPLICATED: '이메일이 이미 존재합니다.',
      },
      PASSWORD: {
        BASE: '비밀번호는 문자열입니다.',
        REQUIRED: '비밀번호를 입력해 주세요.',
        MIN: '비밀번호는 6자리 이상입니다.',
        INCONSISTENT: '비밀번호가 일치하지 않습니다.',
      },
      PASSWORD_CONFIRM: {
        BASE: '비밀번호 확인은 문자입니다.',
        REQUIRED: '비밀번호 확인을 입력해 주세요.',
        MIN: '비밀번호는 6자리 이상입니다.',
      },
      NICKNAME: {
        BASE: '닉네임은 문자열입니다.',
        REQUIRED: '닉네임을 입력해 주세요.',
        DUPLICATED: '별명이 이미 존재합니다.',
      },
      REGION: {
        BASE: '지역명은 문자열입니다.',
        REQUIRED: '지역명을 입력해 주세요.',
      },
      AGE: {
        BASE: '나이는 정수입니다.',
        REQUIRED: '나이를 입력해 주세요.',
      },
      GENDER: {
        BASE: '성별은 문자열입니다.',
        REQUIRED: '성별을 입력해 주세요.',
        ONLY: '성별은 [MALE, FEMALE] 중 하나를 입력해 주세요.',
      },
    },
    SIGN_UP: {
      EMAIL: {
        DUPLICATED: '이메일이나 별명이 이미 존재합니다.',
      },
      VERIFICATION_CODE: {
        BASE: '이메일 인증 코드는 정수입니다.',
        REQUIRED: '이메일 인증 코드를 입력해 주세요.',
        INCONSISTENT: '발송된 인증 코드와 다릅니다.',
        EXPIRED: '메일 인증이 만료되었습니다.', 
        SUCCEED: '메일 인증이 완료되었습니다.',
      },
      SUCCEED: '회원 가입에 성공했습니다.',
    },
    READ: {
      SUCCEED: '내 정보 조회에 성공했습니다.',
    },
    UPDATE: {
      SUCCEED: '내 정보 수정에 성공했습니다.',
      INTRODUCE: {
        BASE: '한 줄 소개는 문자열입니다.',
      },
    },
    FOLLOW: {
      NOT_FOUND: '팔로우 할 사용자가 존재하지 않습니다.',
      IS_FOLLOWED: '이미 팔로우 한 사용자입니다.',
      SUCCEED: '팔로우가 성공했습니다.',
    },
    UN_FOLLOW: {
      NOT_FOUND: '언팔로우 할 사용자가 존재하지 않습니다.',
      NOT_FOLLOWED: '팔로우 하지 않은 사용자입니다.',
      SUCCEED: '팔로우가 해제되었습니다.',
    },
  },
  TRADE: {
    COMMON: {
      TITLE: {
        BASE: '제목은 문자열입니다.',
        REQUIRED: '제목을 입력해 주세요.',
      },
      CONTENT: {
        BASE: '내용은 문자열입니다.',
        REQUIRED: '내용을 입력해 주세요.',
      },
      PRICE: {
        BASE: '가격은 정수입니다.',
        REQUIRED: '가격을 입력해 주세요.',
      },
      REGION: {
        BASE: '지역은 문자열입니다.',
        REQUIRED: '지역을 입력해 주세요.',
      },
      IMG: {
        BASE: '이미지 URL은 문자열입니다.',
        REQUIRED: '이미지 URL을 입력해 주세요.',
      },
      NOT_FOUND: '상품이 존재하지 않습니다.',
    },
    CREATE: {
      SUCCEED: '상품 게시물 작성에 성공했습니다.',
    },
    READ: {
      SUCCEED: '상품 게시물 조회에 성공했습니다.',
    },
    UPDATE: {
      SUCCESS: '상품 게시물 수정에 성공했습니다.',
    },
    DELETE: {
      SUCCESS: '상품 게시물 삭제에 성공했습니다.',
    },
    LIKE: {
      SUCCEED: '게시물 좋아요에 성공했습니다.',
      NO_PERMISSION: '본인의 게시물에 좋아요 할 수 없습니다.',
      DUPLICATED: '이미 좋아요를 눌렀습니다.',
    },
    UNLIKE: {
      SUCCEED: '게시물 좋아요 취소에 성공했습니다.',
      NO_PERMISSION: '본인의 게시물에 좋아요 취소 할 수 없습니다.',
      NOT_LIKE: '좋아요를 누르지 않았습니다.',
    },
    COMPLETE: {
      BUYER_ID: {
        BASE: '구매자 ID는 정수입니다.',
        REQUIRED: '구매자 ID를 입력해 주세요.',
      },
      MANNER: {
        BASE: '매너 상태는 문자열입니다.',
        REQUIRED: '매너 상태를 입력해 주세요.',
        ONLY: '매너 상태는 [good, bad] 중 하나만 입력해 주세요.',
      },
      SELLER_ID: {
        BASE: '판매자 ID는 정수입니다.',
        REQUIRED: '판매자 ID를 입력해 주세요.',
      },
      SALE: {
        FORBIDDEN: '당신은 구매 권한이 없는 사용자 입니다. 회원 가입 하여 인증을 완료하세요.',
        NOT_FOR_SALE: '이미 거래가 완료된 상품입니다.',
        UNAUTHORIZED: '현재 상품은 사용자가 등록한 것이 아닙니다.',
        SUCCEED: '상품 거래 기록 생성에 성공했습니다.',
      },
      PURCHASE: {
        NO_HISTORY: '거래한 이력이 없습니다.',
        SUCCEED: '모든 거래가 정상적으로 완료했습니다.',
      },
    },
    HISTORY: {
      SALE: {
        SUCCEED: '입력된 상품에 대한 판매 기록 조회에 성공했습니다.',
      },
      PURCHASE: {
        SUCCEED: '입력된 상품에 대한 구매 기록 조회에 성공했습니다.',
      },
    },
  },
  COMMENT: {
    COMMON: {
      BASE: '댓글은 문자열입니다.',
      MIN: '댓글을 1자 이상 작성해주세요.',
      MAX: '댓글은 300자를 초과할 수 없습니다.',
      REQUIRED: '댓글을 입력해주세요.',
    },
    CREATE: {
      SUCCEED: '상품 댓글 작성에 성공했습니다.',
    },
    READ: {
      SUCCEED: '상품 댓글 조회에 성공했습니다.',
    },
    UPDATE: {
      NOT_FOUND: '찾으시는 댓글이 없습니다. 다시 한 번 확인해주세요.',
      SUCCEED: '상품 댓글이 정상적으로 수정되었습니다.',
    },
    DELETE: {
      NOT_FOUND: '찾으시는 댓글이 없습니다. 다시 한 번 확인해주세요.',
      SUCCEED: '상품 댓글이 정상적으로 삭제되었습니다.',
    },
  },
};

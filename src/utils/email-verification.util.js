class EmailVerificationUtil {
  static codeNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  static codeIssue() {
    return EmailVerificationUtil.codeNumber(111111, 999999);
  };

  static expirationTime = 5 * 60 * 1000; // 5분 뒤 코드 인증 만료

  static isCodeExpired(timestamp) {
    return Date.now() > timestamp + EmailVerificationUtil.expirationTime;
  };

  static codes = {};
};

export { EmailVerificationUtil }
class EmailVerificationUtil {
  static codeNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  static codeIssue() {
    return EmailVerificationUtil.codeNumber(111111, 999999);
  }

  static codes = {};
}

export { EmailVerificationUtil }
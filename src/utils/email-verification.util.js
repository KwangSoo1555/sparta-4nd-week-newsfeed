class EmailVerificationUtil {
  static codeNumber() {
    return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
  };

  static codeObject = {};
}

export { EmailVerificationUtil }
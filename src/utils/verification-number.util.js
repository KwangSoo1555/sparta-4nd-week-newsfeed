const verificationNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const VERIFICATION_CODE = verificationNumber(111111, 999999);
export const VERIFICATION_CODES = {};

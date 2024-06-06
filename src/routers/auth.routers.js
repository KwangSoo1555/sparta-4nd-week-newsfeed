import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';
import { signInValidator } from '../middlewares/validators/sign-in.validator.middleware.js';
import { refreshTokenValidator } from '../middlewares/require-refresh-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { generateToken } from '../utils/generate-token.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up.validator.middleware.js';
import { EmailVerificationUtil } from '../utils/email-verification.util.js';
import { AUTH_CONSTANT } from '../constants/auth.constant.js';

const router = express.Router();

// 회원 가입
router.post('/sign-up', signUpValidator, async (req, res, next) => {
  try {
    const { email, nickname, password, passwordCheck, region, age, gender, verificationCode } =
      req.body;

    for (const idx in EmailVerificationUtil.codes) {
      if (
        EmailVerificationUtil.codes[idx].email === email &&
        EmailVerificationUtil.codes[idx].code === verificationCode
      ) {
        break;
      } else {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: MESSAGES.USER.SIGN_UP.VERIFICATION_CODE.INCONSISTENT });
      }
    }

    const isExistUser = await prisma.user.findFirst({
      where: { nickname: nickname, email: email },
    });

    if (isExistUser) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json({ message: MESSAGES.USER.SIGN_UP.EMAIL.DUPLICATED });
    }

    if (!passwordCheck) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.USER.COMMON.PASSWORD_CONFIRM });
    }

    if (password !== passwordCheck) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.USER.SIGN_UP.EMAIL.INCONSISTENT });
    }

    const hashedPW = await bcrypt.hash(password, AUTH_CONSTANT.HASH_SALT);

    const userCreate = await prisma.user.create({
      data: {
        nickname,
        email,
        password: hashedPW,
        region,
        age,
        gender,
      },
    });

    const { password: _, ...userWithoutPassword } = userCreate;

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.USER.SIGN_UP.SUCCEED,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

// 로그인 API
router.post('/sign-in', signInValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 이메일 조회불가 또는 비밀번호가 일치하지 않는 경우.
    const user = await prisma.user.findUnique({ where: { email } });
    const isValidUser = user && (await bcrypt.compare(password, user.password));
    if (!isValidUser) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.AUTH.COMMON.UNAUTHORIZED });
    }
    const payload = { id: user.id };
    const data = await generateToken(payload);

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// refreshToken 재발급 API
router.post('/refresh', refreshTokenValidator, async (req, res, next) => {
  try {
    const user = req.user;
    const payload = { id: user.id };
    const data = await generateToken(payload);

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.TOKEN_REFRESH.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// 로그아웃 API
router.post('/sign-out', refreshTokenValidator, async (req, res, next) => {
  try {
    const user = req.user;
    await prisma.refreshToken.update({
      where: { userId: user.id },
      data: {
        refreshToken: null,
      },
    });
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.SIGN_OUT.SUCCEED,
      data: { id: user.id },
    });
  } catch (err) {
    next(err);
  }
});
export default router;

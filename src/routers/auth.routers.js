import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';
import { signInValidator } from '../middlewares/validators/sign-in.validator.middleware.js';
import { refreshTokenValidator } from '../middlewares/require-refresh-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { generateToken } from '../utils/generateToken.util.js';

const router = express.Router();

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
      message: '로그인에 성공하였습니다',
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
      message: '토큰 재발급에 성공하였습니다',
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
    return res
      .status(HTTP_STATUS.OK)
      .json({ status: HTTP_STATUS.OK, message: '로그아웃에 성공했습니다.', data: { id: user.id } });
  } catch (err) {
    next(err);
  }
});
export default router;

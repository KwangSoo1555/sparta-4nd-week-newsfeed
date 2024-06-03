import express from 'express';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { signInValidator } from '../middlewares/validators/sign-in.validator.middleware.js';
import { refreshTokenValidator } from '../middlewares/require-refresh-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

import passport from '../passports/kakao-passport.js';

const router = express.Router();

// 소셜로그인 테스트중
router.get('/fail', async (req, res, next) => {
  return res.status(401).json({ message: 'fail11' });
});
router.get('/success', async (req, res, next) => {
  return res.status(200).json({ message: 'success11' });
});
// 리다이렉트 테스트 중 구현후 수정
router.get('/kakao', passport.authenticate('kakao'));
router.get(
  '/kakao/oauth',
  passport.authenticate('kakao', {
    failureRedirect: '/fail',
  }),
  (req, res) => {
    res.redirect('/success');
  }
);

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
    // accessToken 생성
    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: '12h',
    });

    // refreshToken 생성
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: '7d',
    });
    // refreshToken bcrypt로 해쉬하기
    // salt round 값 환경변수, 상수로 변경하기
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // 서버에 토큰 저장
    await prisma.refreshToken.upsert({
      where: { userId: user.id },
      update: { refreshToken: hashedRefreshToken },
      create: { userId: user.id, refreshToken: hashedRefreshToken },
    });
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: '로그인에 성공하였습니다',
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
});

// refreshToken 재발급 API
router.post('/refresh', refreshTokenValidator, async (req, res, next) => {
  try {
    const user = req.user;
    // accessToken 재발급
    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: '12h',
    });
    // refreshToken 재발급
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: '7d',
    });
    // refreshToken bcrypt로 해쉬
    // salt round 값 환경변수, 상수로 변경
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    // 서버에 토큰 저장
    await prisma.refreshToken.upsert({
      where: { userId: user.id },
      update: { refreshToken: hashedRefreshToken },
      create: { userId: user.id, refreshToken: hashedRefreshToken },
    });
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: '토큰 재발급에 성공하였습니다',
      data: { accessToken, refreshToken },
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

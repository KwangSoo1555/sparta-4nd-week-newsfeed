import express from 'express';

import { naverPassport } from '../passports/naver-passport.js';
import { kakaoPassport } from '../passports/kakao-passport.js';
import { generateToken } from '../utils/generate-token.util.js';
import { MESSAGES } from '../constants/message.constant.js';
import { AUTH_CONSTANT } from '../constants/auth.constant.js';

const router = express.Router();

// 소셜로그인 인증 실패시 API
router.get('/fail', async (req, res, next) => {
  return res.status(401).json({ message: MESSAGES.AUTH.PASSPORT.COMMON.FAIL });
});

// 카카오 소셜 로그인 - 기존 access, refresh jwt 토큰 기반의 미들웨어 인증을 공유하기 위해 기존 토큰 발급 로직 활용
router.get('/kakao', kakaoPassport.authenticate(AUTH_CONSTANT.PASSPORT.KAKAO.NAME));
router.get(
  AUTH_CONSTANT.PASSPORT.KAKAO.OAUTH,
  kakaoPassport.authenticate(AUTH_CONSTANT.PASSPORT.KAKAO.NAME, {
    failureRedirect: AUTH_CONSTANT.PASSPORT.COMMON.FAILURE_REDIRECT,
  }),
  async (req, res) => {
    const user = req.user;
    const payload = { id: user.id };
    // 토큰 생성
    const data = await generateToken(payload);

    res.status(200).json({
      status: 200,
      message: MESSAGES.AUTH.PASSPORT.KAKAO.SUCCEED,
      data,
    });
  }
);

// 네이버 소셜 로그인
router.get('/naver', naverPassport.authenticate(AUTH_CONSTANT.PASSPORT.NAVER.NAME));
router.get(
  AUTH_CONSTANT.PASSPORT.NAVER.OAUTH,
  naverPassport.authenticate(AUTH_CONSTANT.PASSPORT.NAVER.NAME, {
    failureRedirect: AUTH_CONSTANT.PASSPORT.COMMON.FAILURE_REDIRECT,
  }),
  async (req, res) => {
    const user = req.user;
    const payload = { id: user.id };
    const data = await generateToken(payload);

    res.status(200).json({
      status: 200,
      message: MESSAGES.AUTH.PASSPORT.NAVER.SUCCEED,
      data,
    });
  }
);

export default router;

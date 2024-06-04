import express from 'express';

import { naverPassport } from '../passports/naver-passport.js';
import { kakaoPassport } from '../passports/kakao-passport.js';
import { generateToken } from '../utils/generate-token.util.js';

const router = express.Router();

// 소셜로그인 인증 실패시 테스트 api
router.get('/fail', async (req, res, next) => {
  return res.status(401).json({ message: 'fail' });
});

// 카카오 소셜 로그인 - 기존 access, refresh jwt 토큰 기반의 미들웨어 인증을 공유하기 위해 기존 토큰 발급 로직 활용
router.get('/kakao', kakaoPassport.authenticate('kakao'));
router.get(
  '/kakao/oauth',
  kakaoPassport.authenticate('kakao', {
    failureRedirect: '/api/auth/fail',
  }),
  async (req, res) => {
    const user = req.user;
    const payload = { id: user.id };
    // 토큰 생성
    const data = await generateToken(payload);

    res.status(200).json({
      status: 200,
      message: '카카오 로그인에 성공하였습니다.',
      data,
    });
  }
);

// 네이버 소셜 로그인
router.get('/naver', naverPassport.authenticate('naver'));
router.get(
  '/naver/oauth',
  naverPassport.authenticate('naver', {
    failureRedirect: '/api/auth/fail',
  }),
  async (req, res) => {
    const user = req.user;
    const payload = { id: user.id };
    const data = await generateToken(payload);

    res.status(200).json({
      status: 200,
      message: '네이버 로그인에 성공하였습니다.',
      data,
    });
  }
);

export default router;

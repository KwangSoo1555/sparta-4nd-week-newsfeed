import express from 'express';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';

const router = express.Router();

// 로그인 API
router.post('/sign-in', async (req, res, next) => {
  try {
    //유효성 - joi 추가시 설정
    const { email, password } = req.body;

    // 이메일 조회불가 또는 비밀번호가 일치하지 않는 경우
    const user = await prisma.user.findUnique({ where: { email } });
    const isValidUser = user && (await bcrypt.compare(password, user.password));
    if (!isValidUser) {
      return res.status(401).json({ status: 401, message: '인증 정보가 유효하지 않습니다.' });
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
    res.status(200).json({
      status: 200,
      message: '로그인에 성공하였습니다',
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { AUTH_CONSTANT } from '../constants/auth.constant.js';

export const generateToken = async (payload) => {
  const userId = payload.id;
  // accessToken 생성
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: AUTH_CONSTANT.ACCESS_TOKEN_EXPIRED_IN,
  });
  // refreshToken 생성
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: AUTH_CONSTANT.REFRESH_TOKEN_EXPIRED_IN,
  });
  // refreshToken bcrypt로 해쉬하기
  const hashedRefreshToken = await bcrypt.hash(refreshToken, AUTH_CONSTANT.HASH_SALT);

  // 서버에 토큰 저장
  await prisma.refreshToken.upsert({
    where: { userId },
    update: { refreshToken: hashedRefreshToken },
    create: { userId, refreshToken: hashedRefreshToken },
  });
  return { accessToken, refreshToken };
};

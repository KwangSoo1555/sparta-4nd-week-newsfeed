import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { prisma } from '../utils/prisma.util.js';
import bcrypt from 'bcrypt';

// refreshToken 인증 미들웨어

export const refreshTokenValidator = async (req, res, next) => {
  try {
    // 헤더에서 토큰 정보 받아오기
    const { authorization } = req.headers;

    // authorization이 없는 경우
    if (!authorization) {
      return res.status(401).json({ status: 401, message: '인증 정보가 없습니다.' });
    }
    const [tokenType, refreshToken] = authorization.split(' ');
    // refreshToken이 없는 경우
    if (!refreshToken) {
      return res.status(401).json({ status: 401, message: '인증 정보가 없습니다.' });
    }
    if (tokenType !== 'Bearer') {
      return res.status(401).json({ status: 401, message: '지원하지 않는 인증 방식입니다.' });
    }
    let decodedToken;
    try {
      decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
    } catch (err) {
      // 유효기간 만료 시 에러처리
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 401, message: '인증정보가 만료되었습니다.' });
      }
      // 그 밖의 검증 실패(JsonWebTokenError, NotBeforeError)
      else {
        return res.status(401).json({ status: 401, message: '인증정보가 유효하지 않습니다.' });
      }
    }
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      omit: { password: true },
    });
    // 일치하는 유저가 없을 때
    if (!user) {
      return res
        .status(401)
        .json({ status: 401, message: '인증 정보와 일치하는 사용자가 없습니다.' });
    }
    // db에서 refreshToken 조회
    const existedRefreshToken = await prisma.refreshToken.findUnique({
      where: {
        userId: decodedToken.id,
      },
    });
    // refreshToken 검증
    const isValidRefreshToken =
      existedRefreshToken &&
      existedRefreshToken?.refreshToken &&
      bcrypt.compareSync(refreshToken, existedRefreshToken.refreshToken);
    if (!isValidRefreshToken) {
      return res.status(401).json({ status: 401, message: '폐기된 인증 정보입니다.' });
    }
    // refreshToken 인증 통과시 패스워드 제외 유저 정보 req.user를 통해 전달
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

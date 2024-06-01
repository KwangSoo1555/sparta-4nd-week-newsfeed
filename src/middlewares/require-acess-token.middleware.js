import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { prisma } from '../utils/prisma.util.js';

// accessToken 인증 미들웨어

export const accessTokenValidator = async (req, res, next) => {
  try {
    // accessToken 받아오기
    const { authorization } = req.headers;

    // authorization이 없는 경우
    if (!authorization) {
      return res.status(401).json({ status: 401, message: '인증 정보가 없습니다.' });
    }
    const [tokenType, accessToken] = authorization.split(' ');
    // accessToken이 없는 경우
    if (!accessToken) {
      return res.status(401).json({ status: 401, message: '인증 정보가 없습니다.' });
    }
    if (tokenType !== 'Bearer') {
      return res.status(401).json({ status: 401, message: '지원하지 않는 인증 방식입니다.' });
    }
    let decodedToken;
    // jwt.verify 에러를 컨트롤 하는 try, catch문
    try {
      decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
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
    // decodedToken에 담긴 사용자 id와 db의 유저 비교 검증
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      omit: { password: true },
    });
    // 일치하는 사용자가 없을 때
    if (!user) {
      return res
        .status(401)
        .json({ status: 401, message: '인증정보와 일치하는 사용자가 없습니다.' });
    }
    // 인증 통과 시 유저 정보 req.user로 넘기기(password 제외)
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

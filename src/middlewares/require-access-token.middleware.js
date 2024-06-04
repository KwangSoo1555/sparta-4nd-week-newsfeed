import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

// accessToken 인증 미들웨어

export const accessTokenValidator = async (req, res, next) => {
  try {
    // 헤더에서 토큰 정보 받아오기
    const { authorization } = req.headers;

    // authorization이 없는 경우
    if (!authorization) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.AUTH.COMMON.JWT.NO_TOKEN });
    }
    const [tokenType, accessToken] = authorization.split(' ');
    // accessToken이 없는 경우
    if (!accessToken) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.AUTH.COMMON.JWT.NO_TOKEN });
    }
    if (tokenType !== 'Bearer') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.NOT_SUPPORTED_TYPE,
      });
    }
    let decodedToken;
    // jwt.verify 에러를 컨트롤 하는 try, catch문
    try {
      decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
    } catch (err) {
      // 유효기간 만료 시 에러처리
      if (err.name === 'TokenExpiredError') {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.AUTH.COMMON.JWT.EXPIRED });
      }
      // 그 밖의 검증 실패(JsonWebTokenError, NotBeforeError)
      else {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.AUTH.COMMON.JWT.INVALID });
      }
    }
    // decodedToken에 담긴 사용자 id와 db의 유저 비교 검증
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      omit: { password: true },
    });
    // 일치하는 사용자가 없을 때
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTH.COMMON.JWT.NO_USER,
      });
    }
    // bigint 값 json으로 변환 가능하게끔 숫자값으로 변경
    user.socialId = Number(user.socialId);
    // 인증 통과 시 유저 정보 req.user로 넘기기(password 제외)
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

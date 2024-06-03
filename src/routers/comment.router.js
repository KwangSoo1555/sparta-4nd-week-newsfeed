import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up.validator.middleware.js';
import { HASH_SALT } from '../constants/auth.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { verificationCodes } from './auth-email.router.js';

const router = express.Router();

//댓글 작성 기능
router.post('/trade/:trade_id/comment', async (req, res, next) => {
  try {
    const {
      //로그인 정보 확인 및 인가 토큰
    } = req.header;

    if (/* 유효하지 않은 인가 토큰 */ o) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: MESSAGES.COMMENT.SIGN_IN_CHECK });
    }

    if (!(/* 댓글 내용 확인(t/f) */ o)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.COMMENT.LENGTH_CHECK.BASE });
    }

    if (!(/* 댓글 길이 확인(>300) */ o)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.COMMENT.LENGTH_CHECK.REQUIRED });
    }
  } catch (error) {
    next(error);
  }
});

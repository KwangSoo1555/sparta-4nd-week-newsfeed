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
    //trade_id 받아와서, 해당 id에서만 comment 작성되게
    const { trade_id } = req.params;
    const { user_id } = req.user;
    const { comment, nickname } = req.body;
    //로그인 정보 확인 및 인가 토큰

    if (!comment) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.COMMENT.LENGTH_CHECK.BASE });
    }

    if (!comment.length > 300) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.COMMENT.LENGTH_CHECK.REQUIRED });
    }

    const commentCreate = await prisma.tradeComment.create({
      data: {
        tradeId: trade_id,
        userId: user_id,
        comment,
        nickname,
      },
    });
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.CREATED,
      messeage: MESSAGES.COMMENT.CREATE.SUCCEED,
      data: commentCreate,
    });
  } catch (err) {
    next(err);
  }
});

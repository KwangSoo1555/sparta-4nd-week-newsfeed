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
    //user_id 받아와서, 해당 id가 댓글을 작성했다는 것을 확인할 수 있게
    const { user_id } = req.user;
    //body에서 댓글 내용과 댓글 작성자 닉네임 받아오게
    const { comment, nickname } = req.body;

    //댓글 없을 때 에러
    if (!comment) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.COMMENT.LENGTH_CHECK.BASE });
    }
    //댓글이 너무 길 때 에러
    if (!comment.length > 300) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.COMMENT.LENGTH_CHECK.REQUIRED });
    }

    //댓글 작성
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

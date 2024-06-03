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

//��� �ۼ� ���
router.post('/trade/:trade_id/comment', async (req, res, next) => {
  try {
    const {
      //�α��� ���� Ȯ�� �� �ΰ� ��ū
    } = req.header;

    if (/* ��ȿ���� ���� �ΰ� ��ū */ o) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: MESSAGES.COMMENT.SIGN_IN_CHECK });
    }

    if (!(/* ��� ���� Ȯ��(t/f) */ o)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.COMMENT.LENGTH_CHECK.BASE });
    }

    if (!(/* ��� ���� Ȯ��(>300) */ o)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.COMMENT.LENGTH_CHECK.REQUIRED });
    }
  } catch (error) {
    next(error);
  }
});

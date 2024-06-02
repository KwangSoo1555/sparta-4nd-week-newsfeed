import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up.validator.middleware.js';
import { HASH_SALT } from '../constants/auth.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';


const router = express.Router();

router.post('/sign-up', signUpValidator, async (req, res, next) => {
  try {
    const { email, nickname, password, passwordCheck, region, age, gender } = req.body;

    const isExistUser = await prisma.user.findFirst({
      where: { OR: [{ nickname }, { email }] },
    });
    if (isExistUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({ message: MESSAGES.USER.SIGN_UP.EMAIL.DUPLICATED });
    }

    if (!passwordCheck) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.USER.COMMON.PASSWORD_CONFIRM });
    }

    if (password !== passwordCheck) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.USER.SIGN_UP.EMAIL.INCONSISTENT });
    }

    const hashedPW = await bcrypt.hash(password, HASH_SALT);

    const userCreate = await prisma.user.create({
      data: {
        nickname,
        email,
        password: hashedPW,
        region,
        age,
        gender,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.USER.SIGN_UP.SUCCEED,
      data: {
        id: userCreate.id,
        email: userCreate.email,
        nickname: userCreate.nickname,
        region: userCreate.region,
        manner: userCreate.manner,
        role: userCreate.role,
        createdAt: userCreate.createdAt,
        updatedAt: userCreate.updatedAt,
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', accessTokenValidator, async (req, res, next) => {
  try {
    const authUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      omit: { password: true },
    });

    if (!authUser) {
      // 등록된 유저가 없으면 메세지 추가
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Not found user' });
    }

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      // 유저 찾기 성공 메세지 추가
      // message: ,
      data: authUser
    });
  } catch (error) {
    next(error);
  }
});

export default router;

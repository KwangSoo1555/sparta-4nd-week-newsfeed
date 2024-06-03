import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up.validator.middleware.js';
import { HASH_SALT } from '../constants/auth.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { verificationCodes } from './auth-email.router.js'

const router = express.Router();

router.post('/sign-up', signUpValidator, async (req, res, next) => {
  try {
    const {
      email,
      nickname,
      password,
      passwordCheck,
      region,
      age,
      gender,
      verificationCode
    } = req.body;

    let isVerifiedEmailCode = false;
    for (const id in verificationCodes) {
      if (verificationCodes[id].email === email && verificationCodes[id].code === verificationCode) {
        isVerifiedEmailCode = true;
        break;
      }
    };

    if (!isVerifiedEmailCode) {
      // 입력 메일 인증 코드랑 발송된 메일 인증 코드랑 다를 때 메세지 추가
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid or expired verification code.' });
    }

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

    const { password: _, ...userWithoutPassword } = userCreate;

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.USER.SIGN_UP.SUCCEED,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', accessTokenValidator, async (req, res, next) => {
  try {
    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.USER.READ.SUCCEED,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/update', accessTokenValidator, async (req, res, next) => {
  try {
    const { email, nickname, newPassword, currentPasswordCheck, region, age, gender, introduce } = req.body;

    const user = await prisma.user.findUnique({
      where: {id: req.user.id}
    })

    const currentPassword = user.password

    let updatedData = {
      email: email || user.email,
      nickname: nickname || user.nickname,
      region: region || user.region,
      age: age || user.age,
      gender: gender || user.gender, 
      introduce: introduce || user.introduce,  
      password: currentPassword
    };

    // 비밀번호 변경 시 재 해쉬, 번경 없으면 기존 비밀번호
    if (newPassword) {
      const match = bcrypt.compare(currentPassword, currentPasswordCheck)
      if (!currentPasswordCheck || !match) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: HTTP_STATUS.BAD_REQUEST, 
          // message: 
        })
      }
      updatedData.password = await bcrypt.hash(newPassword, HASH_SALT);
    }

    const authUserUpdate = await prisma.user.update({
      where: { id: req.user.id },
      data: updatedData
    });

    const { password: _, ...userWithoutPassword } = authUserUpdate;

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      massage: MESSAGES.USER.UPDATE.SUCCEED,
      data: userWithoutPassword
    })
  } catch (error) {
    next(error);
  }
});

export default router;

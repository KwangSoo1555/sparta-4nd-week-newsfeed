import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up.validator.middleware.js';
import { AUTH_CONSTANT } from '../constants/auth.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { EmailVerificationUtil } from '../utils/email-verification.util.js';

const router = express.Router();

router.post('/sign-up', signUpValidator, async (req, res, next) => {
  try {
    const { email, nickname, password, passwordCheck, region, age, gender, VERIFICATION_CODE } =
      req.body;

    for (const idx in EmailVerificationUtil.codes) {
      if (
        EmailVerificationUtil.codes[idx].email === email &&
        EmailVerificationUtil.codes[idx].code === VERIFICATION_CODE
      ) {
        break;
      } else {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: MESSAGES.USER.SIGN_UP.VERIFICATION_CODE.INCONSISTENT });
      }
    }

    const isExistUser = await prisma.user.findFirst({
      where: { OR: [{ nickname }, { email }] },
    });

    if (isExistUser) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json({ message: MESSAGES.USER.SIGN_UP.EMAIL.DUPLICATED });
    }

    if (!passwordCheck) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.USER.COMMON.PASSWORD_CONFIRM });
    }

    if (password !== passwordCheck) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.USER.SIGN_UP.EMAIL.INCONSISTENT });
    }

    const hashedPW = await bcrypt.hash(password, AUTH_CONSTANT.HASH_SALT);

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

    //omit
    const { password: _, ...userWithoutPassword } = userCreate;

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.USER.SIGN_UP.SUCCEED,
      data: userWithoutPassword,
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
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/update', accessTokenValidator, async (req, res, next) => {
  try {
    const { email, nickname, newPassword, currentPasswordCheck, region, age, gender, introduce } =
      req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const currentPassword = user.password;

    let updatedData = {
      email: email || user.email,
      nickname: nickname || user.nickname,
      region: region || user.region,
      age: age || user.age,
      gender: gender || user.gender,
      introduce: introduce || user.introduce,
      password: currentPassword,
    };

    // 비밀번호 변경 시 재 해쉬, 번경 없으면 기존 비밀번호
    if (newPassword) {
      const match = bcrypt.compare(currentPassword, currentPasswordCheck);
      if (!currentPasswordCheck || !match) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.USER.COMMON.PASSWORD.INCONSISTENT, 
        });
      }
      updatedData.password = await bcrypt.hash(newPassword, AUTH_CONSTANT.HASH_SALT);
    }

    const authUserUpdate = await prisma.user.update({
      where: { id: req.user.id },
      data: updatedData,
    });

    const { password: _, ...userWithoutPassword } = authUserUpdate;

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      massage: MESSAGES.USER.UPDATE.SUCCEED,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

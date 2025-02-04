import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';
import { AUTH_CONSTANT } from '../constants/auth.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

import { uploadImage } from '../middlewares/multer-image-upload.middleware.js';

const router = express.Router();

// 내 정보 조회
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

// 내 정보 수정
router.patch('/', accessTokenValidator, uploadImage.single('img'), async (req, res, next) => {
  try {
    const { email, nickname, newPassword, currentPasswordCheck, region, age, gender, introduce } =
      req.body;

    if (email) {
      const isExistUserEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (isExistUserEmail) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          status: HTTP_STATUS.CONFLICT,
          message: MESSAGES.USER.COMMON.EMAIL.DUPLICATED,
        });
      }
    }

    if (nickname) {
      const isExistUserNickname = await prisma.user.findUnique({
        where: { nickname },
      });
      if (isExistUserNickname) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          status: HTTP_STATUS.CONFLICT,
          message: MESSAGES.USER.COMMON.NICKNAME.DUPLICATED,
        });
      }
    }

    // 비밀번호 변경 시 재 해쉬, 번경 없으면 기존 비밀번호
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const currentPassword = user.password;

    if (newPassword) {
      const passwordMatch = await bcrypt.compare(currentPasswordCheck, currentPassword);

      if (!currentPasswordCheck || !passwordMatch) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.USER.COMMON.PASSWORD.INCONSISTENT,
        });
      }
      user.password = await bcrypt.hash(newPassword, AUTH_CONSTANT.HASH_SALT);
    }

    // req.files에서 이미지 데이터 가져옴
    const image = req.file;

    // 이미지 데이터 처리
    let imgUrl = user.imgUrl;

    if (image) {
      imgUrl = image.location || image.path;
    }

    if (image.size > 5 * 1024 * 1024) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: MESSAGES.ERROR_HANDLER.MULTER.FILE_SIZE,
      });
    }

    const authUserUpdate = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(email && { email }),
        ...(nickname && { nickname }),
        ...(region && { region }),
        ...(age && { age }),
        ...(gender && { gender }),
        ...(introduce && { introduce }),
        ...(newPassword && { password: user.password }),
        ...(image && { imgUrl }),
      },
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

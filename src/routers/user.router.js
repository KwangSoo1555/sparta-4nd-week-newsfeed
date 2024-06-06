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
router.patch('/update',accessTokenValidator, uploadImage.single('img'), async (req, res, next) => {
  try {

    const { email, nickname, newPassword, currentPasswordCheck, region, age, gender, introduce } =
      req.body;

    // req.files에서 이미지 데이터 가져옴
    const image = req.file;

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
      imgUrl: image?.location
    };

    const isExistUser = await prisma.user.findMany({
      where: { email: email, nickname: nickname }
    })
    
    if (isExistUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: HTTP_STATUS.CONFLICT, 
        message: MESSAGES
      })
    }

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

    // 이미지 데이터 처리
    if (!image) {
      updatedData.imgUrl = user.imgUrl;
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

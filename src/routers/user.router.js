import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up.validator.middleware.js';
import { HASH_SALT } from '../constants/auth.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';

const router = express.Router();

router.post('/sign-up', signUpValidator, async (req, res, next) => {
  try {
    const { email, nickname, password, passwordCheck, region, age, gender } = req.body;

    const isExistUser = await prisma.user.findFirst({
      where: { OR: [{ nickname }, { email }] },
    });
    if (isExistUser) {
      return res.status(409).json({ message: 'This email or name are already exist.' });
    }

    if (!passwordCheck) {
      return res.status(400).json({ message: 'You Should have to enter the passwordCheck.' });
    }

    if (password !== passwordCheck) {
      return res.status(400).json({ message: 'Passwords do not match.' });
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

    return res.status(201).json({
      id: userCreate.id,
      email: userCreate.email,
      nickname: userCreate.nickname,
      region: userCreate.region,
      manner: userCreate.manner,
      role: userCreate.role,
      createdAt: userCreate.createdAt,
      updatedAt: userCreate.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

// access token 미들웨어 추가
router.get('/:id', accessTokenValidator, async (req, res, next) => {
  try {
    const authenticatedUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!authenticatedUser) {
      return res.status(404).json({ error: 'Not found user' });
    }

    res.status(200).json(authenticatedUser);
  } catch (error) {
    next(error);
  }
});

export default router;

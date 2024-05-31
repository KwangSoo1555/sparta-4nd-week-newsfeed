import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';

const router = express.Router();
// saltRounds 는 상수 값으로 저장 후 여기서는 삭제 가능
const saltRounds = 10;

router.post('/sign-up', async (req, res, next) => {
  try {
    // joi handle
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

    const hashedPW = await bcrypt.hash(password, saltRounds);

    const userCreate = await prisma.user.create({
      data: {
        nickname,
        email,
        password: hashedPW,
        region, 
        age, 
        gender
      },
    });

    return res.status(201).json({
        id: userCreate.id,
        email: userCreate.email,
        nickname: userCreate.name,
        region: userCreate.region,
        manner: userCreate.manner,
        role: userCreate.role,
        createdAt: userCreate.created_at,
        updatedAt: userCreate.updated_at,
      });
    } catch (error) {
      next(error);
    }
});

// access token 미들웨어 추가
router.get('/', async (req, res, next) => {
  try {
    const authenticatedUser = await prisma.user.findUnique({
      where: { userId: req.userId },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!authenticatedUser) {
      return res.status(404).json({ error: 'Not found user' });
    }

    res.status(200).json(authenticatedUser);
  } catch (error) {
    next(error);
  }
});

export default router

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

import { prisma } from '../utils/prisma.util.js';

const router = express.Router();
const saltRounds = 10;

router.post('/sign-up', async (req, res, next) => {
  try {
    // joi handle
    const { name, email, password, passwordCheck } = req.body;

    const isExistUser = await prisma.users.findFirst({
      where: { OR: [{ name }, { email }] },
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

    const usersCreate = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPW,
      },
    });

    return res.status(201).json({
        id: usersCreate.userId,
        email: usersCreate.email,
        name: usersCreate.name,
        role: usersCreate.role,
        createdAt: usersCreate.createdAt,
        updatedAt: usersCreate.updatedAt,
      });
    } catch (error) {
      next(error);
    }
});

export default router

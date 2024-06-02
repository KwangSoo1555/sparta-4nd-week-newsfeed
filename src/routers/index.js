import express from 'express';
import authRouter from './auth.routers.js';
import tradeRouter from './trade.router.js';
import userRouter from './user.router.js';
import authEmailRouter from './auth-email.router.js';

const router = express.Router();

router.use('/auth', [authRouter, authEmailRouter]);
router.use('/trade', tradeRouter);
router.use('/user', userRouter);

export default router;

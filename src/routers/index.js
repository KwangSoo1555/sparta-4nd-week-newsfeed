import express from 'express';
import authRouter from './auth.routers.js';
import tradeRouter from './trade.router.js';
import userRouter from './user.router.js';
import authEmailRouter from './auth-email.router.js';
import authPassportRouter from './auth-passport.router.js';

const router = express.Router();

router.use('/auth', [authRouter, authEmailRouter, authPassportRouter]);
router.use('/trade', tradeRouter);
router.use('/user', userRouter);

export default router;

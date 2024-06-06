import express from 'express';
import authRouter from './auth.routers.js';
import tradeRouter from './trade.router.js';
import userRouter from './user.router.js';
import authEmailRouter from './auth-email.router.js';
import authPassportRouter from './auth-passport.router.js';
import commentRouter from './comment.router.js';
import historyRouter from './trade-history.router.js';
import tradeCompleteRouter from './trade-complete.router.js';
import followRouter from './follow.router.js';

const router = express.Router();

router.use('/auth', [authRouter, authEmailRouter, authPassportRouter]);
router.use('/trade', [tradeRouter, commentRouter, tradeCompleteRouter]);
router.use('/trade/history', historyRouter);
router.use('/user', [userRouter, followRouter]);

export default router;

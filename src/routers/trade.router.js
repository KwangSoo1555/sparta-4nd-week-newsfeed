import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { createTradeValidator } from '../middlewares/validators/create-trade.validator.middleware.js';

const tradeRouter = express.Router();

// 상품 게시글 작성 API
tradeRouter.post('/create', accessTokenValidator, createTradeValidator, async (req, res, next) => {
  try {
    console.log(req.user);
    // 유효성 검사 거치고 req.body 가져옴
    const { title, content, price, region, img } = req.body;

    // 상품 생성
    const trade = await prisma.trade.create({
      data: { title, content, price, region, img, userId: req.user.id },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.TRADE.CREATE.SUCCEED,
      data: { trade },
    });
  } catch (err) {
    next(err);
  }
});

export default tradeRouter;

import express from 'express';

import { prisma } from '../utils/prisma.util.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { TradeType } from '@prisma/client';
import { MESSAGES } from '../constants/message.constant.js';

const router = express.Router();

router.get('/history/sale', accessTokenValidator, async (req, res, next) => {
  try {
    const saleHistory = await prisma.history.findMany({
      where: { type: TradeType.SALE, userId: req.user.id },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.TRADE.HISTORY.SALE.SUCCEED,
      data: saleHistory,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history/purchase', accessTokenValidator, async (req, res, next) => {
  try {
    const purchaseHistory = await prisma.history.findMany({
      where: { type: TradeType.PURCHASE, userId: req.user.id },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.TRADE.HISTORY.PURCHASE.SUCCEED,
      data: purchaseHistory,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

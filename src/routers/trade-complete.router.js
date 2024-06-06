import express from 'express';

import { prisma } from '../utils/prisma.util.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { TradeType } from '@prisma/client';
import { TRADE_CONSTANT } from '../constants/trade.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

const router = express.Router();

router.post('/:tradeId/history', accessTokenValidator, async (req, res, next) => {
  try {
    const tradeId = +req.params.tradeId;

    const { buyerId } = req.body;

    const findUser = await prisma.user.findUnique({ where: { id: buyerId } });
    const findTrade = await prisma.trade.findFirst({
      where: { id: tradeId },
    });

    // 회원 가입을 하지 않은 사용자가 게시물에 상품을 구매하려 할 때
    if (!findUser) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        status: HTTP_STATUS.FORBIDDEN,
        message: MESSAGES.TRADE.COMPLETE.SALE.FORBIDDEN,
      });
    }

    // 등록되지 않은 상품일 때
    if (!findTrade) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.TRADE.COMMON.NOT_FOUND,
      });
    }

    // 이미 거래가 완료된 상품일 때
    if (findTrade.status !== TRADE_CONSTANT.STATUS.FOR_SALE) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.TRADE.COMPLETE.SALE.NOT_FOR_SALE,
      });
    }

    // 현재 게시물이 지금 로그인한 사용자가 올린 것이 아닐 때
    if (req.user.id !== findTrade.userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.TRADE.COMPLETE.SALE.UNAUTHORIZED,
      });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // 구매 기록 생성
      const purchaseHistory = await tx.history.create({
        data: {
          tradeId: tradeId,
          userId: buyerId,
          type: TradeType.PURCHASE,
        },
      });

      // 판매 기록 생성
      const saleHistory = await tx.history.create({
        data: {
          tradeId: tradeId,
          userId: req.user.id,
          type: TradeType.SALE,
        },
      });

      await tx.trade.update({
        where: { id: tradeId },
        data: {
          status: TRADE_CONSTANT.STATUS.SOLD_OUT,
        },
      });

      return [purchaseHistory, saleHistory];
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.TRADE.COMPLETE.SALE.SUCCEED,
      data: {
        purchaseHistory: transaction[0],
        saleHistory: transaction[1],
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:tradeId/purchase/complete', accessTokenValidator, async (req, res, next) => {
  try {
    const tradeId = +req.params.tradeId;

    const { manner, sellerId } = req.body;

    const sellerUser = await prisma.user.findUnique({ where: { id: sellerId } });

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId, status: TRADE_CONSTANT.STATUS.SOLD_OUT },
    });

    if (!trade) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        state: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.TRADE.COMMON.NOT_FOUND,
      });
    }

    const buyerHistory = await prisma.history.findFirst({
      where: { type: TRADE_CONSTANT.HISTORY.TYPE.PURCHASE, userId: req.user.id, tradeId: tradeId },
    });

    const sellerHistory = await prisma.history.findFirst({
      where: { type: TRADE_CONSTANT.HISTORY.TYPE.SALE, userId: sellerId, tradeId: tradeId },
    });

    if (!buyerHistory || !sellerHistory) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.TRADE.COMPLETE.PURCHASE.NO_HISTORY,
      });
    }

    const selectManner = await prisma.user.update({
      where: { id: sellerId },
      data: {
        manner:
          manner === TRADE_CONSTANT.MANNER.GOOD ? sellerUser.manner + 1 : sellerUser.manner - 1,
      },
    });

    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: TRADE_CONSTANT.STATUS.COMPLETE,
      },
    });

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.TRADE.COMPLETE.PURCHASE.SUCCEED,
      data: selectManner.manner,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

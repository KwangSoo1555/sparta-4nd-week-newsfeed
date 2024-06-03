import express from 'express';
import routes from '../constants/trade.constant.js';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { refreshTokenValidator } from '../middlewares/require-refresh-token.middleware.js';

//validator, error-handle 미들웨어도 추가구현 필요.

const tradeRouter = express.Router();

//tradeRouter.get(routes.tradeList, tradeList);
tradeRouter.post(routes.tradeCreate, refreshTokenValidator, async (req, res, next) => {
  try {
    const { id } = req.user;
    const { title, content, price, region, img } = req.body;

    if (!title)
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.TRADE.CREATE.TITLE });
    if (!content)
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.TRADE.CREATE.CONTENT });

    const tradeCreate = await prisma.trade.create({
      data: {
        userId: id,
        title,
        content,
        price,
        region,
        img,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.TRADE.CREATE.SUCCESS,
      data: tradeCreate,
    });
  } catch (err) {
    next(err);
  }
});
// tradeRouter.get(routes.tradePostDetail, tradeDetail);
// tradeRouter.patch(routes.tradeEdit, updateTrade);
// tradeRouter.delete(routes.tradeDelete, deleteTrade);

export default tradeRouter;

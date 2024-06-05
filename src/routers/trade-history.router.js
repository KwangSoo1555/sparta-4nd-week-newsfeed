import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { TradeType } from '@prisma/client';

const router = express.Router();

router.post('/history/sale/:tradeId', accessTokenValidator, async (req, res, next) => {
    try {
        console.log(req.user)
        const tradeId = +req.params.tradeId;

        const { selectTradeType } = req.body;

        // const tradeType = selectTradeType.toUpperCase() as TradeType;

        const trade = await prisma.trade.findUnique({ where: { id: tradeId } });

        const createHistory = await prisma.history.create({
            data: {
                tradeId,
                type: selectTradeType
            }
        });

    } catch (error) {
        next(error);
    }
});

router.get('/history/:tradeId', accessTokenValidator, async (req, res, next) => {
    try {
        const tradeId = +req.params.tradeId;

        const saleHistory = await prisma.history.findMany({ where: { type: TradeType.SALE } })

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "입력된 상품에 대한 판매 기록 조회에 성공했습니다.",
            data: saleHistory
        })
    } catch (error) {
        next(error);
    }
})

router.get('/history/:tradeId', accessTokenValidator, async (req, res, next) => {
    try {
        const tradeId = +req.params.tradeId;

        const purchaseHistory = await prisma.history.findMany({ where: { type: TradeType.PUSRCASE } })

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "입력된 상품에 대한 구매 기록 조회에 성공했습니다.",
            data: purchaseHistory
        })
    } catch (error) {
        next(error);
    }
})



export default router
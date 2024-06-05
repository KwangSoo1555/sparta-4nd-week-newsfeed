import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { TradeType } from '@prisma/client';

const router = express.Router();

router.post('/:tradeId', accessTokenValidator, async (req, res, next) => {
    try {
        const tradeId = +req.params.tradeId;

        const { buyerId } = req.body;
        
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
            return [purchaseHistory, saleHistory];
        });

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: '상품 거래 기록 생성에 성공했습니다.',
            data: {
                purchaseHistory: transaction.purchaseHistory,
                saleHistory: transaction.saleHistory,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.get('/sale/:tradeId', accessTokenValidator, async (req, res, next) => {
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

router.get('/purchase/:tradeId', accessTokenValidator, async (req, res, next) => {
    try {
        const tradeId = +req.params.tradeId;

        const purchaseHistory = await prisma.history.findMany({ where: { type: TradeType.PURCHASE } })

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

import express from 'express';

import { prisma } from '../utils/prisma.util.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { TradeType } from '@prisma/client';
import { TRADE_CONSTANT } from '../constants/trade.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

const router = express.Router();

router.post('/:tradeId', accessTokenValidator, async (req, res, next) => {
    try {
        const tradeId = +req.params.tradeId;

        const { buyerId } = req.body;

        const findUser = await prisma.user.findUnique({ where: { id: buyerId } });
        const findTrade = await prisma.trade.findFirst({
            where: { id: tradeId }
        });

        // 회원 가입을 하지 않은 사용자가 게시물에 상품을 구매하려 할 때
        if (!findUser) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                status: HTTP_STATUS.FORBIDDEN,
                message: "당신은 구매 권한이 없는 사용자 입니다. 회원 가입 하여 인증을 완료하세요.",
            })
        }

        // 등록되지 않은 상품일 때
        if (!findTrade) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: HTTP_STATUS.NOT_FOUND,
                message: MESSAGES.TRADE.COMMON.NOT_FOUND,
            });
        };

        // 이미 거래가 완료된 상품일 때
        if (findTrade.status !== TRADE_CONSTANT.STATUS.FOR_SALE) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: HTTP_STATUS.NOT_FOUND,
                message: MESSAGES.TRADE.COMMON.NOT_FOUND
            })
        }

        // 현재 게시물이 지금 로그인한 사용자가 올린 것이 아닐 때
        if (req.user.id !== findTrade.userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "현재 상품은 당신이 등록한 것이 아닙니다."
            });
        };

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

            // 거래 완료, status = SOLD_OUT
            await tx.trade.update({
                where: { id: tradeId },
                data: {
                    status: TRADE_CONSTANT.STATUS.SOLD_OUT
                }
            })

            return [purchaseHistory, saleHistory];
        });

        console.log(transaction)
        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: '상품 거래 기록 생성에 성공했습니다.',
            data: {
                purchaseHistory: transaction[0],
                saleHistory: transaction[1],
            },
        });
    } catch (error) {
        next(error);
    }
});

router.get('/sale', accessTokenValidator, async (req, res, next) => {
    try {
        const saleHistory = await prisma.history.findMany({ 
            where: { type: TradeType.SALE, userId: req.user.id } 
        })

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "입력된 상품에 대한 판매 기록 조회에 성공했습니다.",
            data: saleHistory
        })
    } catch (error) {
        next(error);
    }
})

router.get('/purchase', accessTokenValidator, async (req, res, next) => {
    try {
        const purchaseHistory = await prisma.history.findMany({ 
            where: { type: TradeType.PURCHASE, userId: req.user.id } 
        })

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

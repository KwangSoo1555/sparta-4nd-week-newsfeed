import express from 'express';
import routes from '../constants/trade.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';

//유저 아이디 등 필수 요구 사항 필요. 
//validator 미들웨어도 추가구현

const tradeRouter = express.Router();

//tradeRouter.get(routes.tradeList, tradeList);
tradeRouter.post(routes.tradeCreate, accessTokenValidator, async(req, res, next) => {
    const{ user } = req.user;
    const { 
            title, 
            content, 
            price,
            region,
            img,
        } = req.body;

    try{
        const user = await prisma.user.findUnique({
            where: { id: user.id }
        });
        
        if(!title) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.TRADE.CREATE.TITLE });
        if(!content) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.TRADE.CREATE.CONTENT });

        const trade = await prisma.trade.create({
            data: {
                userId: user.id,
                title,
                content,
                price,
                region,
                img,
            },
        });

        const { userId, img, ...resData } = trade;

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.CREATED,
            message: MESSAGES.TRADE.CREATE.SUCCESS,
            data: resData,
        });
    }catch(err){
        next(err);
    }
    }
);
// tradeRouter.get(routes.tradePostDetail, tradeDetail);
// tradeRouter.patch(routes.tradeEdit, updateTrade);
// tradeRouter.delete(routes.tradeDelete, deleteTrade);


export default tradeRouter;

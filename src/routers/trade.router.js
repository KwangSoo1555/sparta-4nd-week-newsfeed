import express from 'express';
import routes from '../constants/trade.constant.js';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from "../constants/message.constant.js";
import { HASH_SALT } from '../constants/auth.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import bcrypt from 'bcrypt';

const tradeRouter = express.Router();

tradeRouter.post(routes.tradeCreate, accessTokenValidator, async(req, res, next) => {
    try{
        const { id } = req.user;
        const { 
                title, 
                content, 
                price,
                region,
                img,
            } = req.body;

        if(!title) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.TRADE.CREATE.TITLE });
        if(!content) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.TRADE.CREATE.CONTENT });

        const tradeCreate = await prisma.trade.create({
            data: {
                userId: id,
                title,
                content,
                price,
                region,
                img
            },
        });

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.CREATED,
            message: MESSAGES.TRADE.CREATE.SUCCESS,
            data: tradeCreate
        });
    }catch(err){
        next(err);
    }
    }
);
tradeRouter.patch(routes.tradeEdit, accessTokenValidator, async (req, res, next) => {
    try{
        const { id } = req.user;
        const { title, content, price } = req.body;

        if(!title && !content) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.TRADE.EDIT.NO_CHANGE });

        const target = await prisma.trade.findUnique({
            where: { id: +req.params }
        });

        const tradeEdit = await prisma.trade.update({ 
            where: { id: +req.params },
            data:{
                title,
                content,
                price
            }
        });

        return res.status(HTTP_STATUS.OK).json({
            message: MESSAGES.TRADE.EDIT.SUCCESS,
            data: tradeEdit
        });
    }catch(err){
        next(err);
    }
});

export default tradeRouter;

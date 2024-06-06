import express, { Router } from 'express';
import { prisma } from '../utils/prisma.util.js';
import { MESSAGES } from '../constants/message.constant.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { FOLLOW_STATUS, FOLLOW_REQUEST } from '../constants/follow.constant.js';

const followRouter = express.Router();


export const myFollowList = async (req, res, next) => {
    const { id, nickname, follow } = req.user;
    try{
        const followList = await prisma.$transaction(async (tx) => {
            await tx.follow.findMany({
                where: { userId: +id },
                select: { 
                    followName: true,
                    followEmail: true,
                    status: true,
                },
                orderBy: {
                    id: 'desc',
                },
            });
            throw new Error('Failed to load the list.');
            return followList;
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        },
        );
        if(!followList) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Follow-list is Empty'});
    }catch(err){
        next(err);
    }
}

export const getFollowStatus = async (req, res, next) => {
    try{
        const result = await prisma.$transaction(async (tx) => {
            await tx.user.findFirst({
                where: { id: +req.id },
                include: {
                    follow: {
                        where: { followName: req.followName },
                        select: {
                        // followEmail: true,
                        // followName: true,
                            status: true
                        },
                    },
                },
            });
            throw new Error('The request failed.');
            return result;
        });
    }catch(err){
        next(err);
    }
}

const getFollowId = async(req, res, next) => {
    try{
        const followId = await prisma.$transaction(
            async (tx) => {
                await prisma.user.findFirst({
                    where: { nickname: req.followName },
                    select: { id: true },
                });
                return followId;
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );
        if(!followId) return res.json(HTTP_STATUS.NOT_FOUND).json({ message: 'Not find the user'});
    }catch(err){
        next(err);
    }
}


export const statusRequestProcess = async(req, res) => {
    const { id, email, nickname } = req.user;
    const { followEmail, followName, content } = req.body;
    try{
        const followId = await getFollowId(followEmail);
        const info : { 
            id, 
            email, 
            nickname,
            followId,
            followEmail,
            followName,
        };
        if(content === FOLLOW_REQUEST.FOLLOW) followRequest(info);
        if(content === FOLLOW_REQUEST.UN_FOLLOW) unFollowRequest(info);
    }catch(err){
        return res.json({err});
    }
}

export const followRequest = async(req, res, next) => {
    try{
        const related = await getFollowStatus(req.info);
        if(!related) createFollowStatus(req.info);
        if(related === FOLLOW_STATUS.FOLLOWER) updateFollowStatus(req.info);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: `already ${related}`});
    }catch(err){
        next(err);
    }
}

export const createFollowStatus = async(req, res, next) => {
    try{
        await prisma.$transaction(
            async (tx) => {
                await tx.follow.create({
                    data: { 
                        userId: +req.id,
                        followId: +req.followId,
                        followEmail: req.followEmail,
                        followName: req.followName,
                        status: FOLLOW_STATUS.FOLLOWING,
                    },
                });

                await tx.follow.create({
                    data: { 
                        userId: +req.followId,
                        followId: +req.id,
                        followEmail: req.email,
                        followName: req.nickname,
                        status: FOLLOW_STATUS.FOLLOWER,
                    },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );
        return res.status(HTTP_STATUS.OK).json({ message: `Follow Request Complete.`});
    }catch(err){
        next(err);
    }
}

export const updateFollowStatus = async(req, res, next) => {
    const updateData = { status: FOLLOW_STATUS.FOLLOW };
    try{
        await prisma.$transaction(
            async (tx) => {
                await prisma.follow.update({
                    data: {
                        ...updateData,
                    },
                    where: {
                        userId: +req.id,
                        followId: +req.followId,
                    },
                });

                await prisma.follow.update({
                    data: { 
                        ...updateData,
                    },
                    where: {
                        userId: +req.followId,
                        followId: +req.id,
                    },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );
        return res.status(HTTP_STATUS.OK).json({ message: 'Follow Request Complete'});
    }catch(err){
        next(err);
    }
}


export const unFollowRequest = async(req, res) => {
    try{
        const related = await getFollowStatus(req.info);
        if(!related) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Not follow listed.'});
        if(related === FOLLOW_STATUS.FOLLOW) updateUnFollowStatus(req.info);
        if(related === FOLLOW_STATUS.FOLLOWING) deleteUnFollowStatus(req.info);
    }catch(err){
        return res.json({err});
    }
};

export const updateUnFollowStatus = async(req, res, next) => {
    const updateMyData = { status: FOLLOW_STATUS.FOLLOWER };
    const updateOtherData = { status: FOLLOW_STATUS.FOLLOWING };
    try{
        await prisma.$transaction(
            async (tx) => {
                await prisma.follow.update({
                    data: {
                        ...updateMyData,
                    },
                    where: {
                        userId: +req.id,
                        followId: +req.followId,
                    }
                });
        
                await prisma.follow.update({
                    data: {
                        ...updateOtherData
                    },
                    where: {
                        userId: +req.followId,
                        followId: +req.id,
                    },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );
        return res.status(HTTP_STATUS.OK).json({ `${FOLLOW_REQUEST.UN_FOLLOW} request complete`});
    }catch(err){
        next(err);
    }
};

export const deleteUnFollowStatus = async(req, res, next) => {
    try{
        await prisma.$transaction(
            async (tx) => {
                await prisma.follow.delete({
                    where: {
                        userId: +req.id,
                        followId: +req.followId,
                    }
                });
        
                await prisma.follow.delete({
                    where:{
                        userId: +req.followId,
                        followId: +req.id,
                    }
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );
        return res.status(HTTP_STATUS.OK).json({ message: 'UN_FOLLOW Request Complete.'});
    }catch(err){
        next(err);
    }
};
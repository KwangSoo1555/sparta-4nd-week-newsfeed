import express, { Router } from 'express';
import { prisma } from '../utils/prisma.util.js';
import { MESSAGES } from '../constants/message.constant.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import ENUM from '../constants/follow.constant.js';

const followRouter = express.Router();

export const separateRequestContent = async (req, res) => {
    const { email, nickname, content } = req.body;
    const { id, nickname, follow } = req.user;

    const followInfo = {
        requester: {
            email,
            nickname
        },
        ByRequested: {
            id,
            nickname,
            follow
        }
    };

    if(content !== ENUM.FOLLOW && content !== ENUM.UN_FOLLOW) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({'only request FOLLOW and UN_FOLLOW.'});
    };
    if(content === ENUM.FOLLOW) followRequestProcess(followInfo);
    if(content === ENUM.UN_FOLLOW) unFollowRequestProcess(followInfo);
}

export const followRequestProcess = async(req, res) => {
    followRequester(req.followInfo);
    acceptFollowRequest(req.followInfo);
    changeFollowRelationship(req.followInfo);
}

export const unFollowRequestProcess = async(req, res) => {
    unFollowRequester(req.followInfo);
    acceptUnFollowRequest(req.followInfo);
    changeUnFollowRelationship(req.followInfo);
}

export const followRequester = async(req, res) => {

}

const followProcess = async(req, res) => {
    try{
        followRequester();
        followRequestAccept();
        changeRelationShip();
    }
    catch(err){
        return res.json(err);
    }
}

const followRequester = async (req, res) => {
    try{
        const changeRelationShip = await prisma.user.update({
            where: { email },
            data: {
                follow: {
                    nickname: req.ByRequested.nickname,
                    relationship: ENUM.FOLLOWING
                }
            }
        });
        return
    }catch(err){
        return res.json(err);
    }
}

const changeByRequested = async(req, res) => {
    const myFollowList = await req.info.ByRequested.follow.map( user => {
        if(user.nickname == req.me.nickname) return user;
    });
    
    if(!followList) followerAccept(req.other.nickname, req.me.id);
    if(followList) followerAccept();
}

const followRequestAccept = async(nickname, id) => {
    try{
        const accept = await prisma.user.update({
            where: { id },
            data: {
                follow: {
                    nickname,
                    relationship: ENUM.FOLLOWER
                }
            }
        });
        return res.json(HTTP_STATUS.OK).json({`Accepted the other person's follow request.`});
    }catch(err){
        return res.json(err);
    }
}
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../utils/prisma.util.js';
import { naverPassport } from '../passports/naver-passport.js';
import { kakaoPassport } from '../passports/kakao-passport.js';
import {
    ACCESS_TOKEN_EXPIRED_IN,
    REFRESH_TOKEN_EXPIRED_IN,
    HASH_SALT,
} from '../constants/auth.constant.js';

const router = express.Router();

// 소셜로그인 인증 실패시 테스트 api
router.get('/fail', async (req, res, next) => {
    return res.status(401).json({ message: 'fail' });
});

// 카카오 소셜 로그인 - 기존 access, refresh jwt 토큰 기반의 미들웨어 인증을 공유하기 위해 기존 토큰 발급 로직 활용
router.get('/kakao', kakaoPassport.authenticate('kakao'));
router.get('/kakao/oauth', kakaoPassport.authenticate('kakao', {
    failureRedirect: '/api/auth/fail',
}),
    async (req, res) => {
        // accessToken 생성
        const accessToken = jwt.sign({ id: req.user.id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
            expiresIn: ACCESS_TOKEN_EXPIRED_IN,
        });

        // refreshToken 생성
        const refreshToken = jwt.sign({ id: req.user.id }, process.env.REFRESH_TOKEN_SECRET_KEY, {
            expiresIn: REFRESH_TOKEN_EXPIRED_IN,
        });
        // refreshToken bcrypt로 해쉬하기
        // salt round 값 환경변수, 상수로 변경하기
        const hashedRefreshToken = await bcrypt.hash(refreshToken, HASH_SALT);

        // 서버에 토큰 저장
        await prisma.refreshToken.upsert({
            where: { userId: req.user.id },
            update: { refreshToken: hashedRefreshToken },
            create: { userId: req.user.id, refreshToken: hashedRefreshToken },
        });
        req.token = { accessToken, refreshToken };
        res.status(200).json({
            status: 200,
            message: '카카오 로그인에 성공하였습니다.',
            data: { accessToken, refreshToken },
        });
    }
);

// 네이버 소셜 로그인
router.get('/naver', naverPassport.authenticate('naver'));
router.get('/naver/oauth', naverPassport.authenticate('naver', {
    failureRedirect: '/api/auth/fail',
}),
    async (req, res) => {
        const accessToken = jwt.sign({ id: req.user.id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
            expiresIn: ACCESS_TOKEN_EXPIRED_IN,
        });

        const refreshToken = jwt.sign({ id: req.user.id }, process.env.REFRESH_TOKEN_SECRET_KEY, {
            expiresIn: REFRESH_TOKEN_EXPIRED_IN,
        });

        const hashedRefreshToken = await bcrypt.hash(refreshToken, HASH_SALT);

        await prisma.refreshToken.upsert({
            where: { userId: req.user.id },
            update: { refreshToken: hashedRefreshToken },
            create: { userId: req.user.id, refreshToken: hashedRefreshToken },
        });
        req.token = { accessToken, refreshToken };
        res.status(200).json({
            status: 200,
            message: '네이버 로그인에 성공하였습니다.',
            data: { accessToken, refreshToken },
        });
    }
);

export default router;
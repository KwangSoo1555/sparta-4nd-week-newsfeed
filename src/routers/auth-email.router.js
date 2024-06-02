import express from 'express';
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const smtpTransport = nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    service: "naver",
    host: "smtp.naver.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: "smtp1234@naver.com",
        pass: "sparta1234"
    },
    tls: {
        rejectUnauthorized: false
    }
});

const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const verificationCodes = {};

router.post('/auth-email', async (req, res, next) => {
    try {
        const { email } = req.body;
        const verificationCode = generateRandomNumber(111111, 999999);
        const verificationId = uuidv4();

        verificationCodes[verificationId] = { email, code: verificationCode };

        const mailOptions = {
            from: "smtp1234@naver.com",
            to: email,
            subject: "인증 관련 메일입니다.",
            html: `<h1>인증번호를 입력해주세요</h1><p>${verificationCode}</p>`
        };

        await smtpTransport.sendMail(mailOptions);

        res.json({ OK: true, message: '메일 전송에 성공하였습니다.', verificationId });
    } catch (error) {
        res.status(500).json({ OK: false, message: '메일 전송에 실패하였습니다.' });
    }
})

export default router;
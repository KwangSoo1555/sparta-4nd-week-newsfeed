import express from 'express';
import nodemailer from "nodemailer";
import 'dotenv/config';

import { v4 as uuidv4 } from 'uuid';
import { AUTH_EMAIL } from '../constants/auth-email.constant.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

const router = express.Router();

const smtpTransport = nodemailer.createTransport({
    pool: true,
    maxConnections: process.env.MAIL_MAX_CONNECTION,
    service: process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS
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
            from: AUTH_EMAIL.OPTION.FROM,
            to: email,
            subject: AUTH_EMAIL.OPTION.SUBJECT,
            html: `<h1>AUTH_EMAIL.OPTION.HTML</h1><p>${verificationCode}</p>`
        };

        await smtpTransport.sendMail(mailOptions);

        console.log(verificationCodes[verificationId].code)

        res.json({ OK: true, message: MESSAGES.AUTH.MAIL.SUCCEED, verificationId });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ OK: false, message: MESSAGES.AUTH.MAIL.FAIL });
    }
});

export default router;
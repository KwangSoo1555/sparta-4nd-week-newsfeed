import express from 'express';
import nodemailer from 'nodemailer';

import { v4 as uuidv4 } from 'uuid';
import { AUTH_CONSTANT } from '../constants/auth.constant.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { EmailVerificationUtil } from '../utils/email-verification.util.js';

const router = express.Router();

// .env 에 관련된 환경변수 전부 다 constant 에서 정리
// 함수도 util 쪽으로 빼서 관리

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
    pass: process.env.MAIL_AUTH_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.post('/auth-email', async (req, res, next) => {
  try {
    const { email } = req.body;

    const verificationId = uuidv4();
    const verificationCode = EmailVerificationUtil.codeIssue();

    EmailVerificationUtil.codes[verificationId] = { email, code: verificationCode };

    // 여기서도 메일 옵션 util 에서 관리 (html은 상수가 아니기 때문)
    // 다른 방법 mailOptions 를 그냥 함수로 만들어 보기
    const mailOptions = {
      from: AUTH_CONSTANT.AUTH_EMAIL.FROM,
      to: email,
      subject: AUTH_CONSTANT.AUTH_EMAIL.SUBJECT,
      html: `<h1>AUTH_CONSTANT.AUTH_EMAIL.HTML</h1><p>${verificationCode}</p>`,
    };

    // 메일 보내는 로직은 await 빼기
    smtpTransport.sendMail(mailOptions);

    console.log(EmailVerificationUtil.codes[verificationId].code);

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.MAIL.SUCCEED,
      data: EmailVerificationUtil.codes,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: MESSAGES.AUTH.MAIL.FAIL,
    });
    next(error);
  }
});

export default router;

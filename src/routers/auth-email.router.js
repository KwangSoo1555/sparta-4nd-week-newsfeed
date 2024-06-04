import express from 'express';
import nodemailer from 'nodemailer';

import { v4 as uuidv4 } from 'uuid';
import { AUTH_CONSTANT } from '../constants/auth.constant.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { VERIFICATION_CODES, VERIFICATION_CODE } from '../utils/verificationNumber.util.js.js';

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

    VERIFICATION_CODES[verificationId] = { email, code: VERIFICATION_CODE };

    const mailOptions = {
      from: AUTH_CONSTANT.AUTH_EMAIL.FROM,
      to: email,
      subject: AUTH_CONSTANT.AUTH_EMAIL.SUBJECT,
      html: `<h1>AUTH_CONSTANT.AUTH_EMAIL.HTML</h1><p>${VERIFICATION_CODE}</p>`,
    };

    await smtpTransport.sendMail(mailOptions);

    console.log(VERIFICATION_CODES[verificationId].code);

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.AUTH.MAIL.SUCCEED,
      data: VERIFICATION_CODES,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: MESSAGES.AUTH.MAIL.FAIL,
    });
  }
});

export default router;

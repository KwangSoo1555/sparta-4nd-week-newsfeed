import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';
import { AUTH_CONSTANT } from '../../constants/auth.constant.js';

// 이메일 인증 유효성 검사
export const authEmailValidator = async (req, res, next) => {
  try {
    const authEmailSchema = Joi.object({
      email: Joi.string()
        .email({
          minDomainSegments: AUTH_CONSTANT.MIN_DOMAIN_SEGMENTS,
          tlds: { allow: AUTH_CONSTANT.TLDS },
        })
        .required()
        .messages({
          'string.base': MESSAGES.AUTH.COMMON.EMAIL.BASE,
          'string.empty': MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
          'string.email': MESSAGES.AUTH.COMMON.EMAIL.EMAIL,
          'any.required': MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
        }),
    });
    await authEmailSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

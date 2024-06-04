import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';
import { AUTH_CONSTANT } from '../../constants/auth.constant';
import { USER_CONSTANT } from '../../constants/user-constant.js';

export const updateUserValidator = async (req, res, next) => {
  try {
    const updateUserSchema = Joi.object({
      email: Joi.string()
        .email({
          minDomainSegments: AUTH_CONSTANT.MIN_DOMAIN_SEGMENTS,
          tlds: { allow: AUTH_CONSTANT.TLDS },
        })
        .messages({
          'string.base': MESSAGES.USER.COMMON.EMAIL.BASE,
          'string.email': MESSAGES.USER.COMMON.EMAIL.EMAIL,
        }),
      nickname: Joi.string().messages({
        'string.base': MESSAGES.USER.COMMON.NICKNAME.BASE,
      }),
      introduce: Joi.string().messages({
        'string.base': MESSAGES.USER.UPDATE.INTRODUCE.BASE,
      }),
      region: Joi.string().messages({
        'string.base': MESSAGES.USER.COMMON.REGION.BASE,
      }),
      age: Joi.number().messages({
        'number.base': MESSAGES.USER.COMMON.AGE.BASE,
      }),
      gender: Joi.string()
        .valid(...Object.values(USER_CONSTANT.GENDER))
        .messages({
          'string.base': MESSAGES.USER.COMMON.GENDER.BASE,
          'string.empty': MESSAGES.USER.COMMON.GENDER.REQUIRED,
          'any.only': MESSAGES.USER.COMMON.GENDER.ONLY,
        }),
      newPassword: Joi.string().min(AUTH_CONSTANT.PASSWORD_MIN_LENGTH).messages({
        'string.base': MESSAGES.USER.COMMON.PASSWORD.BASE,
        'string.min': MESSAGES.USER.COMMON.PASSWORD.MIN,
      }),
      currentPasswordCheck: Joi.string().min(AUTH_CONSTANT.PASSWORD_MIN_LENGTH).messages({
        'string.base': MESSAGES.USER.COMMON.PASSWORD_CONFIRM.BASE,
        'string.min': MESSAGES.USER.COMMON.PASSWORD_CONFIRM.MIN,
      }),
    });
    await updateUserSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

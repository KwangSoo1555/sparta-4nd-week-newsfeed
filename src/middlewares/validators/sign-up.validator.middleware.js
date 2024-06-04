import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';
import { AUTH_CONSTANT } from '../../constants/auth.constant.js';
import { USER_CONSTANT } from '../../constants/user-constant.js';

// 회원가입 유효성 검사 Joi 스키마
export const signUpValidator = async (req, res, next) => {
  try {
    const signUpSchema = Joi.object({
      email: Joi.string()
        .email({
          minDomainSegments: AUTH_CONSTANT.MIN_DOMAIN_SEGMENTS,
          tlds: { allow: AUTH_CONSTANT.TLDS },
        })
        .required()
        .messages({
          'string.base': MESSAGES.USER.COMMON.EMAIL.BASE,
          'string.empty': MESSAGES.USER.COMMON.EMAIL.REQUIRED,
          'string.email': MESSAGES.USER.COMMON.EMAIL.EMAIL,
          'any.required': MESSAGES.USER.COMMON.EMAIL.REQUIRED,
        }),
      nickname: Joi.string().required().messages({
        'string.base': MESSAGES.USER.COMMON.NICKNAME.BASE,
        'string.empty': MESSAGES.USER.COMMON.NICKNAME.REQUIRED,
        'any.required': MESSAGES.USER.COMMON.NICKNAME.REQUIRED,
      }),
      password: Joi.string().min(AUTH_CONSTANT.PASSWORD_MIN_LENGTH).required().messages({
        'string.base': MESSAGES.USER.COMMON.PASSWORD.BASE,
        'string.min': MESSAGES.USER.COMMON.PASSWORD.MIN,
        'string.empty': MESSAGES.USER.COMMON.PASSWORD.REQUIRED,
        'any.required': MESSAGES.USER.COMMON.PASSWORD.REQUIRED,
      }),
      passwordCheck: Joi.string().min(AUTH_CONSTANT.PASSWORD_MIN_LENGTH).required().messages({
        'string.base': MESSAGES.USER.COMMON.PASSWORD_CONFIRM.BASE,
        'string.min': MESSAGES.USER.COMMON.PASSWORD_CONFIRM.MIN,
        'string.empty': MESSAGES.USER.COMMON.PASSWORD_CONFIRM.REQUIRED,
        'any.required': MESSAGES.USER.COMMON.PASSWORD_CONFIRM.REQUIRED,
      }),
      region: Joi.string().required().messages({
        'string.base': MESSAGES.USER.COMMON.REGION.BASE,
        'string.empty': MESSAGES.USER.COMMON.REGION.REQUIRED,
        'any.required': MESSAGES.USER.COMMON.REGION.REQUIRED,
      }),
      age: Joi.number().required().messages({
        'number.base': MESSAGES.USER.COMMON.AGE.BASE,
        'number.empty': MESSAGES.USER.COMMON.AGE.REQUIRED,
        'any.required': MESSAGES.USER.COMMON.AGE.REQUIRED,
      }),
      gender: Joi.string()
        .valid(...Object.values(USER_CONSTANT.GENDER))
        .required()
        .messages({
          'string.base': MESSAGES.USER.COMMON.GENDER.BASE,
          'string.empty': MESSAGES.USER.COMMON.GENDER.REQUIRED,
          'any.only': MESSAGES.USER.COMMON.GENDER.ONLY,
        }),
      VERIFICATION_CODE: Joi.number().required().messages({
        'number.base': MESSAGES.USER.SIGN_UP.VERIFICATION_CODE.BASE,
        'number.empty': MESSAGES.USER.SIGN_UP.VERIFICATION_CODE.REQUIRED,
        'any.required': MESSAGES.USER.SIGN_UP.VERIFICATION_CODE.REQUIRED,
      }),
    });
    await signUpSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';

export const createTradeValidator = async (req, res, next) => {
  try {
    const createTradeSchema = Joi.object({
      title: Joi.string().required().messages({
        'string.base': MESSAGES.TRADE.COMMON.TITLE.BASE,
        'string.empty': MESSAGES.TRADE.COMMON.TITLE.REQUIRED,
        'any.required': MESSAGES.TRADE.COMMON.TITLE.REQUIRED,
      }),
      content: Joi.string().required().messages({
        'string.base': MESSAGES.TRADE.COMMON.CONTENT.BASE,
        'string.empty': MESSAGES.TRADE.COMMON.CONTENT.REQUIRED,
        'any.required': MESSAGES.TRADE.COMMON.CONTENT.REQUIRED,
      }),
      price: Joi.number().required().messages({
        'number.base': MESSAGES.TRADE.COMMON.PRICE.BASE,
        'number.empty': MESSAGES.TRADE.COMMON.PRICE.REQUIRED,
        'any.required': MESSAGES.TRADE.COMMON.PRICE.REQUIRED,
      }),
      region: Joi.string().required().messages({
        'string.base': MESSAGES.TRADE.COMMON.REGION.BASE,
        'string.empty': MESSAGES.TRADE.COMMON.REGION.REQUIRED,
        'any.required': MESSAGES.TRADE.COMMON.REGION.REQUIRED,
      }),
      img: Joi.array().min(1).required().messages({
        'array.base': MESSAGES.TRADE.COMMON.IMG.BASE,
        'array.min': MESSAGES.TRADE.COMMON.IMG.REQUIRED,
        'any.required': MESSAGES.TRADE.COMMON.IMG.REQUIRED,
      }),
    });
    await createTradeSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

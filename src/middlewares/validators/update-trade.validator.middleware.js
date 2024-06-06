import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';

export const updateTradeValidator = async (req, res, next) => {
  try {
    const updateTradeSchema = Joi.object({
      title: Joi.string().messages({
        'string.base': MESSAGES.TRADE.COMMON.TITLE.BASE,
      }),
      content: Joi.string().messages({
        'string.base': MESSAGES.TRADE.COMMON.CONTENT.BASE,
      }),
      price: Joi.number().messages({
        'number.base': MESSAGES.TRADE.COMMON.PRICE.BASE,
      }),
      region: Joi.string().messages({
        'string.base': MESSAGES.TRADE.COMMON.REGION.BASE,
      }),
      img: Joi.array().messages({
        'array.base': MESSAGES.TRADE.COMMON.IMG.BASE,
      }),
    });
    await updateTradeSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

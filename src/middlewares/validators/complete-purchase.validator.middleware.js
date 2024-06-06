import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';
import { TRADE_CONSTANT } from '../../constants/trade.constant.js';

// 구매 완료 유효성 검사
export const completePurchaseValidator = async (req, res, next) => {
  try {
    const completePurchaseSchema = Joi.object({
      manner: Joi.string()
        .valid(...Object.values(TRADE_CONSTANT.MANNER))
        .required()
        .messages({
          'string.base': MESSAGES.TRADE.COMPLETE.MANNER.BASE,
          'string.empty': MESSAGES.TRADE.COMPLETE.MANNER.REQUIRED,
          'any.required': MESSAGES.TRADE.COMPLETE.MANNER.REQUIRED,
          'any.only': MESSAGES.TRADE.COMPLETE.MANNER.ONLY,
        }),
      sellerId: Joi.number().required().messages({
        'number.base': MESSAGES.TRADE.COMPLETE.BUYER_ID.BASE,
        'number.empty': MESSAGES.TRADE.COMPLETE.BUYER_ID.REQUIRED,
        'any.required': MESSAGES.TRADE.COMPLETE.BUYER_ID.REQUIRED,
      }),
    });
    await completePurchaseSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

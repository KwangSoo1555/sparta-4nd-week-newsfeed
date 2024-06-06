import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';

// 판매 완료 유효성 검사
export const completeSaleValidator = async (req, res, next) => {
  try {
    const completeSaleSchema = Joi.object({
      buyerId: Joi.number().required().messages({
        'number.base': MESSAGES.TRADE.COMPLETE.BUYER_ID.BASE,
        'number.empty': MESSAGES.TRADE.COMPLETE.BUYER_ID.REQUIRED,
        'any.required': MESSAGES.TRADE.COMPLETE.BUYER_ID.REQUIRED,
      }),
    });
    await completeSaleSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';

export const createCommentValidator = async (req, res, next) => {
  try {
    const createCommentSchema = Joi.object({
      comment: Joi.string().min(1).max(300).required().messages({
        'string.base': MESSAGES.COMMENT.COMMON.BASE,
        'string.empty': MESSAGES.COMMENT.COMMON.REQUIRED,
        'string.min': MESSAGES.COMMENT.COMMON.MIN,
        'string.max': MESSAGES.COMMENT.COMMON.MAX,
        'any.required': MESSAGES.COMMENT.COMMON.REQUIRED,
      }),
    });
    await createCommentSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

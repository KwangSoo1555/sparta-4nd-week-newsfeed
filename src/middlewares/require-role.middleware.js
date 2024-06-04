import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

// 역할 인가 미들웨어
export const requireRoles = (params) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      const hasPermission = user && params.includes(user.role);
      if (!hasPermission) {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json({ status: HTTP_STATUS.FORBIDDEN, message: MESSAGES.AUTH.COMMON.FORBIDDEN });
      }
      next();
    } catch (err) {
      return next(err);
    }
  };
};

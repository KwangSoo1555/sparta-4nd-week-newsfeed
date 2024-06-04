import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';

const router = express.Router();

//댓글 작성 기능
router.post('/:tradeId/comment', accessTokenValidator, async (req, res, next) => {
  try {
    //trade_id 받아와서, 해당 id에서만 comment 작성되게
    const { tradeId } = req.params;
    //user_id 받아와서, 해당 id가 댓글을 작성했다는 것을 확인할 수 있게
    const { id } = req.user;
    //body에서 댓글 내용과 댓글 작성자 닉네임 받아오게
    const { comment } = req.body;

    console.log(req.user)

    //댓글 작성
    const commentCreate = await prisma.tradeComment.create({
      data: {
        tradeId : +tradeId,
        userId : id,
        comment,
      },
    });
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.COMMENT.CREATE.SUCCEED,
      data: commentCreate,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
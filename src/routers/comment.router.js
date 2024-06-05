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
    //body에서 댓글 내용 받아오게
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
    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.COMMENT.CREATE.SUCCEED,
      data: commentCreate,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:tradeId/comment', async (req, res) => {
    {  
      const { tradeId } = req.params

      //댓글 조회는 기본적으로 시간 순 
      let sortDate = req.query.sort?.toLowerCase();
      let type
      type = {createdAt : sortDate}



      //조회 코드
      let commentsRead = await prisma.tradeComment.findMany({
        where : { tradeId : +tradeId, },
        orderBy : type.asc, //오래된 댓글이 최상단
      })


      //tradeComment 테이블 데이터 조회
      commentsRead = commentsRead.map((tradeComment) => {
        return {
        id : tradeComment.id,
        trade : tradeComment.tradeId.id,
        userId : tradeComment.userId.id,
        comment : tradeComment.comment,
        // nickname : tradeComment.user.nickname,  //닉네임 조회가 안 됨(undefined)
        // like : tradeComment.likedBy.length,  //좋아요 기능 넣을 때 대비
        createdAt : tradeComment.createdAt,
        updatedAt : tradeComment.updatedAt,
      }}
      )

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.COMMENT.READ.SUCCEED,
        data: {
          commentsRead,
        },
      });
    }
  });

export default router;
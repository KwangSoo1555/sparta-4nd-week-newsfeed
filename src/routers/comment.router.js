import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { updateCommentValidator } from '../middlewares/validators/update-comment.validator.middleware.js';

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
        include : {user : true},
        orderBy : type.asc, //오래된 댓글이 최상단
      })


      //tradeComment 테이블 데이터 조회
      commentsRead = commentsRead.map((tradeComment) => {
        return {
        id : tradeComment.id,
        trade : tradeComment.tradeId.id,
        userId : tradeComment.userId.id,
        nickname : tradeComment.user.nickname,
        comment : tradeComment.comment,
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

router.patch(
  "/:tradeId/comment/:commentId",
  accessTokenValidator,
  updateCommentValidator,
  async (req, res, next) => {
  try {
    const id = req.params.commentId

    //댓글 id 찾고, 그 댓글을 작성한 사람의 id가 user 테이블의 id와 같으면
    const commentExist = await prisma.tradeComment.findFirst({
      where : { 
        id : +id,
        userId : req.user.id
      }
    })

    // 댓글이 없으면
    if (!commentExist) {
      return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ status : HTTP_STATUS.NOT_FOUND,
        message : '찾으시는 댓글이 없습니다. 다시 한 번 확인해주세요.'})
    }

    // 수정할 comment 내용 입력받기
    const { comment } = req.body

    //유효성 검사
    if ( !comment ) {
      return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({
        status : HTTP_STATUS.BAD_REQUEST,
        message : '댓글을 입력해주세요.'
      })
    }

    if ( comment > 300 ) {
      return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({
        status : HTTP_STATUS.BAD_REQUEST,
        message : '댓글은 300자를 초과할 수 없습니다.'
      })
    }

    const commentUpdate = await prisma.tradeComment.update({
      where : { id : +id },
      data : {
        ...(comment && {comment}),
      },
    })

   return res
   .status(HTTP_STATUS.CREATED)
   .json({
    status : HTTP_STATUS.CREATED,
    message : '상품 댓글이 정상적으로 수정되었습니다.',
    data : { commentUpdate },
   })

} catch (err) {
  next (err)
}}
)

export default router;
import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { TRADE_CONSTANT } from '../constants/trade.constant.js';
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

    // 상품 조회하기
    let trade = await prisma.trade.findFirst({
      where: { id: +tradeId, status: TRADE_CONSTANT.STATUS.FOR_SALE },
    });

    // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
    if (!trade) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
    }

    if (!comment) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: '댓글을 입력해주세요.',
      });
    }

    if (comment > 300) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: '댓글은 300자를 초과할 수 없습니다.',
      });
    }
    //댓글 작성
    const commentCreate = await prisma.tradeComment.create({
      data: {
        tradeId: +tradeId,
        userId: id,
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
    const { tradeId } = req.params;

    // 상품 조회하기
    let trade = await prisma.trade.findFirst({
      where: { id: +tradeId, status: TRADE_CONSTANT.STATUS.FOR_SALE },
      include : { likedBy : true }
    });

    // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
    if (!trade) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
    }

    //댓글 조회는 기본적으로 시간 순
    let sortDate = req.query.sort?.toLowerCase();
    let type;
    type = { createdAt: sortDate };

    //조회 코드
    let commentsRead = await prisma.tradeComment.findMany({
      where: { tradeId: +tradeId },
      include: { user: true , likedby : true},
      orderBy: type.asc, //오래된 댓글이 최상단
    });


    //tradeComment 테이블 데이터 조회
    commentsRead = commentsRead.map((tradeComment) => {
      return {
        id: tradeComment.id,
        trade: tradeComment.tradeId.id,
        userId: tradeComment.userId.id,
        nickname: tradeComment.user.nickname,
        comment: tradeComment.comment,
        like : tradeComment.likedby.length,  
        createdAt: tradeComment.createdAt,
        updatedAt: tradeComment.updatedAt,
      };
    });

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
  '/:tradeId/comment/:commentId',
  accessTokenValidator,
  updateCommentValidator,
  async (req, res, next) => {
    try {
      const { tradeId } = req.params;

      // 상품 조회하기
      let trade = await prisma.trade.findFirst({
        where: { id: +tradeId, status: TRADE_CONSTANT.STATUS.FOR_SALE },
      });

      // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
      if (!trade) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
      }

      const id = req.params.commentId;

      //댓글 id 찾고, 그 댓글을 작성한 사람의 id가 user 테이블의 id와 같으면
      const commentExist = await prisma.tradeComment.findFirst({
        where: {
          id: +id,
          userId: req.user.id,
        },
      });

      // 댓글이 없으면
      if (!commentExist) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: HTTP_STATUS.NOT_FOUND,
          message: '찾으시는 댓글이 없습니다. 다시 한 번 확인해주세요.',
        });
      }

      // 수정할 comment 내용 입력받기
      const { comment } = req.body;

      //유효성 검사
      if (!comment) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: HTTP_STATUS.BAD_REQUEST,
          message: '댓글을 입력해주세요.',
        });
      }

      if (comment > 300) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: HTTP_STATUS.BAD_REQUEST,
          message: '댓글은 300자를 초과할 수 없습니다.',
        });
      }

      const commentUpdate = await prisma.tradeComment.update({
        where: { id: +id },
        data: {
          ...(comment && { comment }),
        },
      });

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: '상품 댓글이 정상적으로 수정되었습니다.',
        data: { commentUpdate },
      });
    } catch (err) {
      next(err);
    }
  }
);

//댓글 좋아요 api
router.post('/:tradeId/comment/:commentId/like', accessTokenValidator, async (req, res, next) =>{
  try {
    const tradeId = req.params.tradeId;

    // 상품 조회하기
    let trade = await prisma.trade.findFirst({
      where: { id: +tradeId, status: TRADE_CONSTANT.STATUS.FOR_SALE },
    });

    // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
    if (!trade) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
    }

    const commentId = req.params.commentId;

    //댓글 id 찾기
    const commentExist = await prisma.tradeComment.findFirst({
      where: {
        id: +commentId,
      },
      include : {
        likedby : true
      },
    });

    // 댓글이 없으면
    if (!commentExist) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: '찾으시는 댓글이 없습니다. 다시 한 번 확인해주세요.',
      });
    }

    //댓글 작성자가 자기 댓글 좋아요 누르려고 하면
    if (commentExist.userId === req.user.id) {
      return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({
        status : HTTP_STATUS.BAD_REQUEST,
        message : "자신이 쓴 댓글은 좋아요 할 수 없습니다."
      })
    }

    //한 명의 유저가 동일한 댓글에 좋아요를 중복으로 누르려 하면
    const isDuplicatedLike = commentExist.likedby.filter((user) => {
      return user.id === req.user.id
    })
    if (isDuplicatedLike.length !== 0){
      return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({
        status : HTTP_STATUS.BAD_REQUEST,
        message : "이미 좋아요를 한 댓글입니다."
      })
    }

    const user = await prisma.user.update({
      where : {id : req.user.id},
      omit : {password : true},
      data : {
        likedTradeComment : {
          connect : { id : commentExist.id },
        },
      },
    })

    return res
    .status(HTTP_STATUS.CREATED)
    .json({
      status : HTTP_STATUS.CREATED,
      message : '댓글 좋아요에 성공했습니다.',
      data : { commentid : commentExist.id , userId : user.id},
    })
  } catch(err) {
    next(err)
  }
})

//좋아요 취소
router.post('/:tradeId/comment/:commentId/unlike', accessTokenValidator, async (req, res, next) =>{
  try {
    const tradeId = req.params.tradeId;

    // 상품 조회하기
    let trade = await prisma.trade.findFirst({
      where: { id: +tradeId, status: TRADE_CONSTANT.STATUS.FOR_SALE },
    });

    // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
    if (!trade) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
    }

    const commentId = req.params.commentId;

    //댓글 id 찾기
    const commentExist = await prisma.tradeComment.findFirst({
      where: {
        id: +commentId,
      },
      include : {
        likedby : true
      },
    });

    // 댓글이 없으면
    if (!commentExist) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: '찾으시는 댓글이 없습니다. 다시 한 번 확인해주세요.',
      });
    }

    //댓글 작성자가 자기 댓글 좋아요 취소 누르려고 하면
    if (commentExist.userId === req.user.id) {
      return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({
        status : HTTP_STATUS.BAD_REQUEST,
        message : "자신이 쓴 댓글에는 좋아요 취소 할 수 없습니다."
      })
    }

    //한 명의 유저가 동일한 댓글에 좋아요 취소를 중복으로 누르려 하면
    const isDuplicatedLike = commentExist.likedby.filter((user) => {
      return user.id === req.user.id
    })
    if (isDuplicatedLike.length === 0){
      return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({
        status : HTTP_STATUS.BAD_REQUEST,
        message : "좋아요를 누르지 않았습니다."
      })
    }

    const user = await prisma.user.update({
      where : {id : req.user.id},
      omit : {password : true},
      data : {
        likedTradeComment : {
          disconnect : { id : commentExist.id },
        },
      },
    })

    return res
    .status(HTTP_STATUS.CREATED)
    .json({
      status : HTTP_STATUS.CREATED,
      message : '댓글 좋아요가 취소되었습니다.',
      data : { commentid : commentExist.id , userId : user.id},
    })
  } catch(err) {
    next(err)
  }
})

router.delete('/:tradeId/comment/:commentId', accessTokenValidator, async (req, res, next) => {
  try {
    const { tradeId } = req.params;

    // 상품 조회하기
    let trade = await prisma.trade.findFirst({
      where: { id: +tradeId, status: TRADE_CONSTANT.STATUS.FOR_SALE },
    });

    // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
    if (!trade) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
    }

    const id = req.params.commentId;

    //댓글 id 찾고, 그 댓글을 작성한 사람의 id가 user 테이블의 id와 같으면 삭제api 작동
    const commentExist = await prisma.tradeComment.findFirst({
      where: {
        id: +id,
        userId: req.user.id,
      },
    });

    // 댓글이 없으면 err
    if (!commentExist) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: '찾으시는 댓글이 없습니다. 다시 한 번 확인해주세요.',
      });
    }

    const commentDelete = await prisma.tradeComment.delete({
      where: { id: +id, userId: req.user.id },
      select: { id: true },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.COMMENT.DELETE.SUCCEED,
      data: { commentDelete },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

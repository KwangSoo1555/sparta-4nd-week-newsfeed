import express, { Router } from 'express';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { SORT } from '../constants/trade.constant.js';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { createTradeValidator } from '../middlewares/validators/create-trade.validator.middleware.js';
import { updateTradeValidator } from '../middlewares/validators/update-trade.validator.middleware.js';

const tradeRouter = express.Router();

// 상품 게시물 작성 API
tradeRouter.post('/', accessTokenValidator, createTradeValidator, async (req, res, next) => {
  try {
    // 유효성 검사 거치고 req.body 가져옴
    const { title, content, price, region, img } = req.body;

    console.log(img);

    // 상품 생성 + 이미지 등록 트랜젝션으로 처리
    const trade = await prisma.$transaction(async (tx) => {
      // 상품 생성
      const newTrade = await tx.trade.create({
        data: { title, content, price, region, userId: req.user.id },
      });

      // 상품 사진 등록
      // 이미지가 여러 장인 경우 Promise.All로 비동기적으로 실행
      const tradeImg = await Promise.all(
        img.map(async (url) => {
          return await tx.tradePicture.create({ data: { tradeId: newTrade.id, imgUrl: url } });
        })
      );
      return [newTrade, tradeImg];
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.TRADE.CREATE.SUCCEED,
      data: { trade },
    });
  } catch (err) {
    next(err);
  }
});

// 상품 게시물 목록 조회 API (뉴스피드)
tradeRouter.get('/', async (req, res) => {
  // 정렬 조건 쿼리 가져오기
  let sortDate = req.query.sort?.toLowerCase();
  let sortLike = req.query.like?.toLowerCase();
  let type; // 쿼리 orderBy 조건을 담을 변수

  // like 정렬 쿼리가 있으면 좋아요 순으로 정렬
  if (sortLike) {
    // 시간 순 정렬 기본 값 설정
    if (sortLike !== SORT.desc && sortLike !== SORT.asc) {
      sortLike = SORT.desc;
    }
    // 같은 좋아요가 있는 경우 최신순으로 정렬
    type = [{ likedBy: { _count: sortLike } }, { createdAt: SORT.desc }];
  } else {
    // 좋아요 순 정렬 기본 값 설정 (상세한 내용은 회의가 필요)
    if (sortDate !== SORT.desc && sortDate !== SORT.asc) {
      sortDate = SORT.desc;
    }
    type = { createdAt: sortDate };
  }

  // trade 테이블의 데이터 모두를 조회
  let trades = await prisma.trade.findMany({
    include: { tradePicture: true, user: true, likedBy: true },
    orderBy: type,
    omit: { content: true },
  });

  trades = trades.map((trade) => {
    return {
      id: trade.id,
      userId: trade.user.id,
      title: trade.title,
      price: trade.price,
      region: trade.region,
      like: trade.likedBy.length,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
      tradePicture: trade.tradePicture.map((img) => img.imgUrl),
    };
  });

  return res
    .status(HTTP_STATUS.OK)
    .json({ status: HTTP_STATUS.OK, message: MESSAGES.TRADE.READ.SUCCEED, data: { trades } });
});

// 상품 게시물 상세 조회 API
tradeRouter.get('/:tradeId', async (req, res) => {
  // 상품 ID 가져오기
  const id = req.params.tradeId;

  // 상품 조회하기
  let trade = await prisma.trade.findFirst({
    where: { id: +id },
    include: { tradePicture: true, user: true },
  });

  // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
  if (!trade) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
  }

  trade = {
    id: trade.id,
    userId: trade.user.id,
    title: trade.title,
    price: trade.price,
    region: trade.region,
    like: trade.likedBy.length,
    createdAt: trade.createdAt,
    updatedAt: trade.updatedAt,
    tradePicture: trade.tradePicture.map((img) => img.imgUrl),
  };

  return res
    .status(HTTP_STATUS.OK)
    .json({ status: HTTP_STATUS.OK, message: MESSAGES.TRADE.READ.SUCCEED, data: { trade } });
});

// 상품 게시물 수정 API
tradeRouter.patch(
  '/:tradeId',
  accessTokenValidator,
  updateTradeValidator,
  async (req, res, next) => {
    try {
      // 상품 ID 가져오기
      const id = req.params.tradeId;

      // 상품 조회하기
      const trade = await prisma.trade.findFirst({ where: { id: +id, userId: req.user.id } });

      // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
      if (!trade) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
      }

      // 수정할 내용 입력 받음
      const { title, content, price, region, img } = req.body;

      // 게시물 수정 + 이미지 삭제 및 추가 트랜젝션으로 처리
      const changedTrade = await prisma.$transaction(async (tx) => {
        // 상품 수정
        const tradeTemp = await tx.trade.update({
          where: { id: trade.id },
          data: {
            ...(title && { title }),
            ...(content && { content }),
            ...(price && { price }),
            ...(region && { region }),
          },
        });

        // 상품 이미지 수정 (정확히는 삭제 후 등록)
        // 이미지 개수가 다를 수도 있고 어떤 이미지가 어떤 이미지로 수정되는지 알 방법이 없음
        await tx.tradePicture.deleteMany({ where: { tradeId: trade.id } });
        const tradeImg = await Promise.all(
          img.map(async (url) => {
            return await tx.tradePicture.create({ data: { tradeId: trade.id, imgUrl: url } });
          })
        );
        return [tradeTemp, tradeImg];
      });

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.TRADE.UPDATE.SUCCESS,
        data: { changedTrade },
      });
    } catch (err) {
      next(err);
    }
  }
);

// 상품 게시물 삭제 API
tradeRouter.delete('/:tradeId', accessTokenValidator, async (req, res, next) => {
  try {
    // 게시물 ID 가져오기
    const id = req.params.tradeId;

    // 상품 조회하기
    const trade = await prisma.trade.findFirst({ where: { id: +id, userId: req.user.id } });

    // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
    if (!trade) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
    }

    const deletedTradeId = await prisma.trade.delete({
      where: { id: +id, userId: req.user.id },
      select: { id: true },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.TRADE.DELETE.SUCCESS,
      data: { deletedTradeId },
    });
  } catch (err) {
    next(err);
  }
});

// 상품 게시글 좋아요 API
tradeRouter.post('/:tradeId/like', accessTokenValidator, async (req, res, next) => {
  try {
    // 상품 게시글 ID 가져오기
    const id = req.params.tradeId;

    // 상품 조회하기
    const trade = await prisma.trade.findFirst({ where: { id: +id }, include: { likedBy: true } });

    // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
    if (!trade) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
    }

    // 사용자 본인의 게시글에는 좋아요 누르지 못하도록 함
    if (trade.userId === req.user.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.TRADE.LIKE.NO_PERMISSION });
    }

    // 이미 좋아요를 누른 경우
    const isDuplicatedLike = trade.likedBy.filter((user) => {
      return user.id === req.user.id;
    });
    if (isDuplicatedLike.length !== 0) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.TRADE.LIKE.DUPLICATED });
    }

    // 사용자가 좋아요를 누르는 로직
    const user = await prisma.user.update({
      where: { id: req.user.id },
      omit: { password: true },
      data: {
        likedTrade: {
          connect: { id: trade.id },
        },
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.TRADE.LIKE.SUCCEED,
      data: { tradeId: trade.id, userId: user.id },
    });
  } catch (err) {
    next(err);
  }
});

// 상품 게시물 좋아요 취소 API
tradeRouter.post('/:tradeId/unlike', accessTokenValidator, async (req, res, next) => {
  try {
    // 상품 게시물 ID 가져오기
    const id = req.params.tradeId;

    // 상품 조회하기
    const trade = await prisma.trade.findFirst({ where: { id: +id }, include: { likedBy: true } });

    // 데이터베이스 상 해당 상품 ID에 대한 정보가 없는 경우
    if (!trade) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.TRADE.COMMON.NOT_FOUND });
    }

    // 사용자 본인의 게시글에는 좋아요 취소 누르지 못하도록 함
    if (trade.userId === req.user.id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.TRADE.UNLIKE.NO_PERMISSION });
    }

    // 이미 좋아요 취소를 누른 경우
    const isDuplicatedUnlike = trade.likedBy.filter((user) => {
      return user.id === req.user.id;
    });
    if (isDuplicatedUnlike.length === 0) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.TRADE.UNLIKE.NOT_LIKE });
    }

    // 사용자가 좋아요 취소를 누르는 로직
    const user = await prisma.user.update({
      where: { id: req.user.id },
      omit: { password: true },
      data: {
        likedTrade: {
          disconnect: { id: trade.id },
        },
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.TRADE.UNLIKE.SUCCEED,
      data: { tradeId: trade.id, userId: user.id },
    });
  } catch (err) {
    next(err);
  }
});

export default tradeRouter;

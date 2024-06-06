import expess from 'express';
import { accessTokenValidator } from '../middlewares/require-access-token.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';

const router = expess.Router();

// 팔로우
router.post('/follow/:id', accessTokenValidator, async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const followingId = +req.params.id;
    // 팔로우 할 유저 존재 유무 확인
    const user = await prisma.user.findUnique({
      where: {
        id: followingId,
      },
    });
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: '팔로우 할 사용자가 존재하지 않습니다.',
      });
    }
    // 팔로우 정보 DB에 저장
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
    return res
      .status(HTTP_STATUS.OK)
      .json({ status: HTTP_STATUS.OK, message: '팔로우가 성공하였습니다.', data: { follow } });
  } catch (err) {
    next(err);
  }
});

// 언팔로우
router.delete('/un-follow/:id', accessTokenValidator, async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const followingId = +req.params.id;
    // 언팔로우 할 유저 존재 유무 확인
    const user = await prisma.user.findUnique({
      where: {
        id: followingId,
      },
    });
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: '언팔로우 할 사용자가 존재하지 않습니다.',
      });
    }
    // 삭제할 팔로우 확인(delete는 where에 id값이 필요, deleteMany의 경우 다른 조건으로 작동 가능)
    const follow = await prisma.follow.findFirst({ where: { followerId, followingId } });
    // 해당 팔로우 삭제
    const unFollow = await prisma.follow.delete({
      where: {
        id: follow.id,
      },
    });
    return res
      .status(HTTP_STATUS.OK)
      .json({ status: HTTP_STATUS.OK, message: '팔로우가 해제되었습니다.', data: { unFollow } });
  } catch (err) {
    next(err);
  }
});
export default router;

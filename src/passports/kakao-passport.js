import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.util.js';
import 'dotenv/config';

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const CALLBACK_URL = process.env.KAKAO_CALLBACK_URL;

passport.use(
  new KakaoStrategy(
    {
      clientID: KAKAO_CLIENT_ID,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: { socialId: profile.id },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile._json.kakao_account.email,
              nickname: profile.displayName,
              socialId: profile.id,
              provider: 'KAKAO',
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;

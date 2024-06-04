import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.util.js';

const KAKAO_CLIENT_ID = 'ddd0ad7dd5b59d5ebe52830bdd9074c0';
const KAKAO_CLIENT_SECRET = 'YOUR_KAKAO_CLIENT_SECRET';
const CALLBACK_URL = 'http://localhost:3333/api/auth/kakao/oauth';

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
              // provider: profile.provider,
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

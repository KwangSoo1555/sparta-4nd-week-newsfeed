import passport from "passport";
import 'dotenv/config';
import { Strategy as NaverStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.util.js';

const CALLBACK_URL = 'http://localhost:3333/api/auth/naver/callback';

passport.use(
    new NaverStrategy(
        {
            clientID: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await prisma.user.findFirst({
                    where: { socialId: profile.id },
                });
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: profile._json.naver_account.email,
                            nickname: profile.displayName,
                            socialId: profile.id,
                            provider: 'NAVER',
                        }
                    });
                }
                return done(null, user);
            } catch (error) {
                return done(err);
            }
        }
    )
);

export default passport
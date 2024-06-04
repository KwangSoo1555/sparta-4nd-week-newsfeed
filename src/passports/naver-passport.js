import passport from "passport";

import { Strategy as NaverStrategy } from 'passport-naver';
import { prisma } from '../utils/prisma.util.js';

passport.use(
    new NaverStrategy(
        {
            clientID: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
            callbackURL : process.env.NAVER_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await prisma.user.findFirst({
                    where: { socialId: profile.id },
                });
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: profile._json.email,
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

passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export { passport as naverPassport }
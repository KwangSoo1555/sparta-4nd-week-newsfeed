import express from 'express';
import 'dotenv/config';
import router from './routers/index.js';
import { prisma } from './utils/prisma.util.js'; // 연결 테스트용, 나중에 지울 것
import session from 'express-session';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // HTTPS를 사용할 경우 true로 설정
  })
);
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Hello world!!');
});

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});

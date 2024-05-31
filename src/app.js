import express from 'express';
import dotenv from 'dotenv';
import router from './routers/index.js';
import { prisma } from './utils/prisma.util.js'; // 연결 테스트용, 나중에 지울 것

import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Hello world!!');
});

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});

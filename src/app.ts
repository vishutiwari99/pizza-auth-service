import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import tenantsRouter from './routes/tenant';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
app.use(express.static('public'));
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get('/', async (req, res) => {
  res.send('Welcome to Auth Service');
});

app.use('/auth', authRouter);
app.use('/tenants', tenantsRouter);
app.use('/users', userRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: '',
        location: '',
      },
    ],
  });
});

export default app;

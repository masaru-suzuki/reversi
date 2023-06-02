import express from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import { PORT } from './application/constants';
import { gameRouter } from './presentation/gameRouter';
import { turnRouter } from './presentation/turnRouter';
import { DomainError } from './domain/error/domainError';

const app = express();

app.use(morgan('dev'));
app.use(express.static('public', { extensions: ['html'] }));
app.use(express.json());

app.get('/api/hello', async (_req, res) => {
  res.json({
    message: 'Hello Express!!!',
  });
});

app.get('/api/error', async (_req, _res) => {
  throw new Error('Error endpoint');
});

app.use(gameRouter);
app.use(turnRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`);
});

interface ErrorResponseBody {
  type: string;
  message: string;
}

function errorHandler(
  err: any,
  _req: express.Request,
  res: express.Response<ErrorResponseBody>,
  _next: express.NextFunction
) {
  if (err instanceof DomainError) {
    res.status(400).json({
      type: err.type,
      message: err.message,
    });
    return;
  }

  console.error('Unexpected error occurred', err);
  res.status(500).json({
    type: 'UnecpectedError',
    message: 'Unexpected error occurred',
  });
}

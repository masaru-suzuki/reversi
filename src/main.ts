import { TurnRecord } from './dataaccess/turnRecord';
import { GameRecord } from './dataaccess/gameRecord';
import { MoveRecord } from './dataaccess/moveRecord';
import { GameGateway } from './dataaccess/gameGateway';
import { MoveGateway } from './dataaccess/moveGateway';
import express from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import mysql from 'mysql2/promise';
import { TurnGateway } from './dataaccess/turnGateway';
import { SquareGateway } from './dataaccess/squareGateway';

const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const INITIAL_BOARD = [
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, DARK, LIGHT, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, LIGHT, DARK, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
];

const PORT = 3011;

const app = express();

app.use(morgan('dev'));
app.use(express.static('public', { extensions: ['html'] }));
app.use(express.json());

// なぜここでインスタンス化するのか？
const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

app.get('/api/hello', async (req, res) => {
  res.json({
    message: 'Hello Express!!!',
  });
});

const connectMySql = async () => {
  return await mysql.createConnection({
    host: 'localhost',
    database: 'reversi',
    user: 'reversi',
    password: 'password',
  });
};

app.get('/api/error', async (req, res) => {
  throw new Error('Error endpoint');
});

app.post('/api/games', async (req, res) => {
  const now = new Date();

  const conn = await connectMySql();
  try {
    await conn.beginTransaction();

    const GameRecord = await gameGateway.insert(conn, now);

    const turnRecord = await turnGateway.insert(conn, GameRecord.id, 0, DARK, now);

    await squareGateway.insertAll(conn, turnRecord.id, INITIAL_BOARD);

    await conn.commit();
  } finally {
    await conn.end();
  }

  res.status(201).end();
});

app.get('/api/games/latest/turns/:turnCount', async (req, res) => {
  const turnCount = parseInt(req.params.turnCount);

  const conn = await connectMySql();

  try {
    const gameRecord = await gameGateway.findLatest(conn);

    if (!gameRecord) throw new Error('GameRecordが見つかりませんでした');

    const turnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, turnCount);

    const squareRecords = await squareGateway.findForTurnId(conn, turnRecord.id);

    const board = Array.from(Array(8)).map(() => Array(8));
    squareRecords.forEach((square) => {
      board[square.y][square.x] = square.disc;
    });

    const responseBody = {
      turnCount,
      board,
      nextDisc: turnRecord.nextDisc,
      // TODO: winnerDiscに勝者のディスクを設定する。決着がついた場合はgame_resultsテーブルから値を取得する。
      winnerDisc: null,
    };

    res.json(responseBody);
  } finally {
    conn.end();
  }
});

app.post('/api/games/latest/turns/', async (req, res) => {
  // 一つ前のターンの情報を取得する
  const turnCount = parseInt(req.body.turnCount);
  const disc = parseInt(req.body.move.disc);
  const x = parseInt(req.body.move.x);
  const y = parseInt(req.body.move.y);
  console.log({ turnCount }, { disc }, { x }, { y });

  const conn = await connectMySql();

  try {
    await conn.beginTransaction();

    const gameRecord = await gameGateway.findLatest(conn);

    const previousTurnCount = turnCount - 1;

    const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, previousTurnCount);

    const squareRecords = await squareGateway.findForTurnId(conn, previousTurnRecord.id);

    const board = Array.from(Array(8)).map(() => Array(8));
    squareRecords.forEach((square) => {
      board[square.y][square.x] = square.disc;
    });

    // 盤面に置けるかチェックする

    // 石を置く

    board[y][x] = disc;

    // ひっくり返す

    // ターンを保存する
    const now = new Date();
    const nextDisc = disc === DARK ? LIGHT : DARK;
    const turnRecord = await turnGateway.insert(conn, gameRecord.id, turnCount, nextDisc, now);

    await squareGateway.insertAll(conn, turnRecord.id, board);

    moveGateway.insert(conn, turnRecord.id, disc, x, y);

    await conn.commit();
  } finally {
    conn.end();
  }

  // バグの原因！この記述がなかったら処理が終わっても、レスポンスを返さない
  res.status(201).end();
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`);
});

function errorHandler(err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) {
  console.error('Unexpected error occurred', err);
  res.status(500).send({
    message: 'Unexpected error occurred',
  });
}

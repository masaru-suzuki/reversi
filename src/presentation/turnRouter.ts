import express from 'express';
import { DARK, LIGHT } from '../application/constants';
import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { MoveGateway } from '../dataaccess/moveGateway';
import { SquareGateway } from '../dataaccess/squareGateway';
import { TurnGateway } from '../dataaccess/turnGateway';

export const turnRouter = express.Router();

// なぜここでインスタンス化するのか？
const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

turnRouter.get('/api/games/latest/turns/:turnCount', async (req, res) => {
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

turnRouter.post('/api/games/latest/turns/', async (req, res) => {
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

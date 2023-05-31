import express from 'express';
import { DARK, LIGHT } from '../application/constants';
import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { MoveGateway } from '../dataaccess/moveGateway';
import { SquareGateway } from '../dataaccess/squareGateway';
import { TurnGateway } from '../dataaccess/turnGateway';
import { TurnService } from '../application/turnService';

export const turnRouter = express.Router();

// なぜここでインスタンス化するのか？
const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();
const turnService = new TurnService();

interface TurnGetResponseBody {
  turnCount: number;
  board: number[][];
  nextDisc: number | null;
  winnerDisc: number | null;
}

turnRouter.get('/api/games/latest/turns/:turnCount', async (req, res: express.Response<TurnGetResponseBody>) => {
  const turnCount = parseInt(req.params.turnCount);
  const output = await turnService.findLatestTurnByTurnCount(turnCount);

  const responseBody = {
    turnCount: output.turnCount,
    board: output.board,
    nextDisc: output.nextDisc ?? null,
    winnerDisc: output.winnerDisc ?? null,
  };

  // 【未解決】responseBodyとoutputのboardが違う？？outputをレスポンスに渡すと、boardがundefinedになる

  res.json(responseBody);
});

interface TurnPostRequestBody {
  turnCount: number;
  move: {
    disc: number;
    x: number;
    y: number;
  };
}

turnRouter.post('/api/games/latest/turns/', async (req: express.Request<{}, {}, TurnPostRequestBody>, res) => {
  // 一つ前のターンの情報を取得する
  const turnCount = req.body.turnCount;
  const disc = req.body.move.disc;
  const x = req.body.move.x;
  const y = req.body.move.y;

  await turnService.registerTurn(turnCount, disc, x, y);

  // バグの原因！この記述がなかったら処理が終わっても、レスポンスを返さない
  res.status(201).end();
});

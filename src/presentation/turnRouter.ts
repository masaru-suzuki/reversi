import express from 'express';
import { RegisterTurnUseCase } from '../application/useCase/registerTurnUseCase';
import { FindLatestTurnByTurnCountOutputUseCase } from '../application/useCase/findLatestTurnByTurnCountOutputUseCase';
import { Point } from '../domain/model/turn/point';
import { toDisc } from '../domain/model/turn/disc';
import { TurnMySQLRepository } from '../infrastructure/repository/turn/turnMySQLRepository';
import { GameMySQLRepository } from '../infrastructure/repository/game/gameMySQLRepository';
import { GameResultMySQLRepository } from '../infrastructure/repository/gameResult/gameResultMySQLRepository';

export const turnRouter = express.Router();

// なぜここでインスタンス化するのか？
const registerTurnUseCase = new RegisterTurnUseCase(
  new TurnMySQLRepository(),
  new GameMySQLRepository(),
  new GameResultMySQLRepository()
);

const findLatestTurnByTurnCountOutputUseCase = new FindLatestTurnByTurnCountOutputUseCase(
  new TurnMySQLRepository(),
  new GameMySQLRepository(),
  new GameResultMySQLRepository()
);

interface TurnGetResponseBody {
  turnCount: number;
  board: number[][];
  nextDisc: number | null;
  winnerDisc: number | null;
}

turnRouter.get('/api/games/latest/turns/:turnCount', async (req, res: express.Response<TurnGetResponseBody>) => {
  const turnCount = parseInt(req.params.turnCount);
  const output = await findLatestTurnByTurnCountOutputUseCase.run(turnCount);

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
  // MEMO: 不正な値かどうかをバリデーションする時に、ここでバリデーションするのもいいが、
  // アプリケーションが大きくなると、他の箇所でもバリデーションをする可能性が高いため、x,yについてはpoint.tsでバリデーションを行う
  const turnCount = req.body.turnCount;
  const disc = toDisc(req.body.move.disc);
  const point = new Point(req.body.move.x, req.body.move.y); // Pointクラスでバリデーションを行う

  await registerTurnUseCase.run(turnCount, disc, point);

  // バグの原因！この記述がなかったら処理が終わっても、レスポンスを返さない
  res.status(201).end();
});

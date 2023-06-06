import { FindLastGameUseCase } from './../application/useCase/findLastGamesUseCase';
import express from 'express';
import { StartNewGameUseCase } from '../application/useCase/startNewGameUseCase';
import { TurnMySQLRepository } from '../infrastructure/repository/turn/turnMySQLRepository';
import { GameMySQLRepository } from '../infrastructure/repository/game/gameMySQLRepository';
import { FindLastGameMySQLQueryService } from '../infrastructure/query/findLastGameMySQLQueryService';

export const gameRouter = express.Router();

// 依存性の注入とは、クラスの外部から依存するオブジェクトを渡すことで、クラス内部で依存オブジェクトを生成しないようにすること
// プレゼンテーション層がinfrastructure層に依存しないようにするためには、DIContainerを使う
const gameService = new StartNewGameUseCase(new TurnMySQLRepository(), new GameMySQLRepository());

const findLastGameUseCase = new FindLastGameUseCase(new FindLastGameMySQLQueryService());

interface GetGamesResponseBody {
  games: {
    id: number;
    darkMoveCount: number;
    lightMoveCount: number;
    winnerDisc: number;
    startedAt: Date;
    endAt: Date;
  }[];
}

gameRouter.get('/api/games', async (req, res: express.Response<GetGamesResponseBody>) => {
  const output = await findLastGameUseCase.run();
  const responseBodyGames = output.map((game) => {
    return {
      id: game.gameId,
      darkMoveCount: game.darkMoveCount,
      lightMoveCount: game.lightMoveCount,
      winnerDisc: game.winnerDisc,
      startedAt: game.startedAt,
      endAt: game.endAt,
    };
  });

  const responseBody = {
    games: responseBodyGames,
  };

  res.json(responseBody);
});

gameRouter.post('/api/games', async (req, res) => {
  await gameService.run();
  res.status(201).end();
});

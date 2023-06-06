import express from 'express';
import { GameService } from '../application/service/gameService';
import { TurnMySQLRepository } from '../infrastructure/repository/turn/turnMySQLRepository';
import { GameMySQLRepository } from '../infrastructure/repository/game/gameMySQLRepository';

export const gameRouter = express.Router();

// 依存性の注入とは、クラスの外部から依存するオブジェクトを渡すことで、クラス内部で依存オブジェクトを生成しないようにすること
const gameService = new GameService(new TurnMySQLRepository(), new GameMySQLRepository());

gameRouter.post('/api/games', async (req, res) => {
  await gameService.startNewGame();
  res.status(201).end();
});

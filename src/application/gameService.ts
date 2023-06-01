import { TurnRepository } from '../domain/turn/turnRepository';
import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { firstTurn } from '../domain/turn/turn';
import { GameRepository } from '../domain/game/gameRepository';
import { Game } from '../domain/game/game';

const gameGateway = new GameGateway();
const turnRepository = new TurnRepository();
const gameRepository = new GameRepository();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const conn = await connectMySql();

    try {
      await conn.beginTransaction();

      // 新しいゲームの作成
      const newGame = new Game(undefined, now);

      const game = await gameRepository.save(conn, newGame);

      if (!game.id) {
        throw new Error('game.id is undefined');
      }

      // ターンの初期化
      const turn = firstTurn(game.id, now);

      // ターンの保存
      await turnRepository.save(conn, turn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}

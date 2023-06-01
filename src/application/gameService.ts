import { TurnRepository } from '../domain/turn/turnRepository';
import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { firstTurn } from '../domain/turn/turn';

const gameGateway = new GameGateway();
const turnRepository = new TurnRepository();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const conn = await connectMySql();

    try {
      await conn.beginTransaction();

      const GameRecord = await gameGateway.insert(conn, now);

      // ターンの初期化
      const turn = firstTurn(GameRecord.id, now);

      // ターンの保存
      await turnRepository.save(conn, turn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}

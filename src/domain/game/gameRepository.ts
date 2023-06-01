import mysql from 'mysql2/promise';
import { GameGateway } from '../../infrastructure/gameGateway';
import { Game } from './game';

const gameGateway = new GameGateway();

export class GameRepository {
  // 戻り値も設定する
  async findLatest(conn: mysql.Connection): Promise<Game | undefined> {
    const gameRecord = await gameGateway.findLatest(conn);

    if (!gameRecord) {
      return undefined;
    } else {
      return new Game(gameRecord.id, gameRecord.startedAt);
    }
  }

  async save(conn: mysql.Connection, game: Game): Promise<Game> {
    const gameRecord = await gameGateway.insert(conn, game.startedAt);
    return new Game(gameRecord.id, gameRecord.startedAt);
  }
}

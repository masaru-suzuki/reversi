import mysql from 'mysql2/promise';
import { GameResult } from '../../../domain/model/gameResult/gameResult';
import { GameResultGateway } from '../gameResult/gameResultGateway';
import { toWinnerDisc } from '../../../domain/model/gameResult/winnerDisc';
import { GameRepository } from '../../../domain/model/game/gameRepository';
import { Game } from '../../../domain/model/game/game';
import { GameGateway } from './gameGateway';

const gameGateway = new GameGateway();

export class gameMySQLRepository implements GameRepository {
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

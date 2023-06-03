import mysql from 'mysql2/promise';
import { gameResultRecord } from './gameResultRecord';
import { GameResult } from '../domain/model/gameResult/gameResult';
export class GameResultGateway {
  async findForGameId(conn: mysql.Connection, gameId: number): Promise<gameResultRecord | undefined> {
    const gameSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      'select id, game_id, winner_disc, end_at from game_results where game_id = ?',
      [gameId]
    );

    const record = gameSelectResult[0][0];

    if (!record) return undefined;

    return new gameResultRecord(record['id'], record['game_id'], record['winner_disc'], record['end_at']);
  }

  async insert(conn: mysql.Connection, gameResult: GameResult) {
    await conn.execute('insert into game_results (game_id, winner_disc, end_at) values (?, ?, ?)', [
      gameResult.gameId,
      gameResult.winnerDisc,
      gameResult.endAt,
    ]);
  }
}

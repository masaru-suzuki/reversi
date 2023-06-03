import mysql from 'mysql2/promise';
import { GameResult } from './gameResult';
export class GameResultRepository {
  async findForGameId(conn: mysql.Connection, gameId: number): Promise<GameResult | undefined> {
    // TODO:
    throw new Error('Not implemented');
  }

  async save(conn: mysql.Connection, gameResult: GameResult) {}
}

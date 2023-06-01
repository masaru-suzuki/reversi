import mysql from 'mysql2/promise';
import { MoveRecord } from './moveRecord';

export class MoveGateway {
  async findForTurnId(conn: mysql.Connection, turnId: number): Promise<MoveRecord> {
    const movesSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      'select id, turn_id, disc, x, y from moves where turn_id = ?',
      [turnId]
    );

    const records = movesSelectResult[0][0];

    if (!records) {
      return undefined;
    }

    return new MoveRecord(records['id'], records['turn_id'], records['disc'], records['x'], records['y']);
  }

  async insert(conn: mysql.Connection, turnId: number, disc: number, x: number, y: number) {
    await conn.execute('insert into moves (turn_id, disc, x, y) values (?, ?, ?, ?)', [turnId, disc, x, y]);
  }
}

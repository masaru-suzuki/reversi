import { Board } from './board';
import mysql from 'mysql2/promise';
import { GameGateway } from '../../../infrastructure/repository/game/gameGateway';
import { MoveGateway } from '../../../infrastructure/moveGateway';
import { SquareGateway } from '../../../infrastructure/squareGateway';
import { TurnGateway } from '../../../infrastructure/turnGateway';
import { Move } from './move';
import { MoveRecord } from '../../../infrastructure/moveRecord';
import { toDisc } from './disc';
import { Point } from './point';
import { Turn } from './turn';
import { DomainError } from '../../error/domainError';
// turnServiceのfindLatestTurnByTurnCountで行っているデータアクセス層への処理（responseBodyで返すためのデータの取得）を、domain層にRepositoryパターンを追加して、そこでデータへのアクセスを行う。
// これにより、turnServiceはデータアクセス層への処理を意識することなく、ドメインモデルの操作(処理の流れ)に集中できる。

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class TurnRepository {
  async findForGameIdAndTurnCount(conn: mysql.Connection, gameId: number, turnCount: number): Promise<Turn> {
    const turnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameId, turnCount);

    if (!turnRecord) {
      throw new DomainError('SpecifiedTurnNotFound', 'Specified turn not found');
    }

    const squareRecords = await squareGateway.findForTurnId(conn, turnRecord.id);

    const board = Array.from(Array(8)).map(() => Array(8));
    squareRecords.forEach((square) => {
      board[square.y][square.x] = square.disc;
    });

    const moveRecord = await moveGateway.findForTurnId(conn, turnRecord.id);
    let move: Move | undefined;

    if (moveRecord) {
      move = new Move(toDisc(moveRecord.disc), new Point(moveRecord.x, moveRecord.y));
    }

    // プロパティって頭に入っているの？講義だとすんなり渡しているけど、どこでプロパティを定義しているのか、覚えていられない。
    const nextDisc = turnRecord.nextDisc === null ? undefined : toDisc(turnRecord.nextDisc);
    return new Turn(gameId, turnCount, nextDisc, move, new Board(board), turnRecord.endAt);
  }

  async save(conn: mysql.Connection, turn: Turn) {
    const turnRecord = await turnGateway.insert(conn, turn.gameId, turn.turnCount, turn.nextDisc, turn.endAt);

    await squareGateway.insertAll(conn, turnRecord.id, turn.board.discs);

    // MEMO: moveがない可能性がある
    if (turn.move) {
      await moveGateway.insert(conn, turnRecord.id, turn.move.disc, turn.move.point.x, turn.move.point.y);
    }
  }
}

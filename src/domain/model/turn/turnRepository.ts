import { Board } from './board';
import mysql from 'mysql2/promise';
import { GameGateway } from '../../../infrastructure/repository/game/gameGateway';
import { MoveGateway } from '../../../infrastructure/moveGateway';
import { SquareGateway } from '../../../infrastructure/squareGateway';
import { TurnGateway } from '../../../infrastructure/repository/trun/turnGateway';
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

export interface TurnRepository {
  findForGameIdAndTurnCount(conn: mysql.Connection, gameId: number, turnCount: number): Promise<Turn>;
  save(conn: mysql.Connection, turn: Turn);
}

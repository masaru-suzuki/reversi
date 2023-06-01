import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { toDisc } from '../domain/disc';
import { Point } from '../domain/point';
import { TurnRepository } from './../domain/turnRepository';

const gameGateway = new GameGateway();
const turnRepository = new TurnRepository();

class findLatestTurnByTurnCountOutput {
  constructor(
    private _turnCount: number,
    private _board: number[][],
    private _nextDisc: number | undefined,
    private _winnerDisc: number | undefined
  ) {}

  get turnCount() {
    return this._turnCount;
  }

  get board() {
    return this._board;
  }

  get nextDisc() {
    return this._nextDisc;
  }

  get winnerDisc() {
    return this._winnerDisc;
  }
}

export class TurnService {
  async findLatestTurnByTurnCount(turnCount: number): Promise<findLatestTurnByTurnCountOutput> {
    const conn = await connectMySql();

    try {
      // MEMO: サービスクラスでdataaccess層への処理が多く、ユースケースの流れがわかりにくい
      // このような場合は、domain層にRepositoryパターンを追加して、そこでデータへのアクセスを行う
      const gameRecord = await gameGateway.findLatest(conn);

      if (!gameRecord) {
        throw new Error('GameRecordが見つかりませんでした');
      }

      const turn = await turnRepository.findForGameIdAndTurnCount(conn, gameRecord.id, turnCount);
      console.log(turn);

      const responseBody = new findLatestTurnByTurnCountOutput(
        turnCount,
        turn.board.discs, //turn.boardではない。board.tsを参照する
        turn.nextDisc,
        // TODO 決着がついている場合、game_results テーブルから取得する
        undefined
      );

      return responseBody;
      // サービスクラスでレスポンスを返すのはおかしいので、responseBodyを返す
      // レスポンスはプレゼンテーション層で行う
      // res.json(responseBody);
    } finally {
      // connectionの切断についてはサービスクラスで行ってもいい
      await conn.end();
    }
  }

  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
    const conn = await connectMySql();

    try {
      await conn.beginTransaction();

      const gameRecord = await gameGateway.findLatest(conn);

      if (!gameRecord) {
        throw new Error('Latest game not found');
      }

      const previousTurnCount = turnCount - 1;

      const previousTurn = await turnRepository.findForGameIdAndTurnCount(conn, gameRecord.id, previousTurnCount);

      // 盤面に置けるかチェックする

      // 石を置く
      const newTurn = previousTurn.placeNext(toDisc(disc), new Point(x, y));

      // ターンを保存する
      await turnRepository.save(conn, newTurn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}

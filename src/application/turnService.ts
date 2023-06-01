import { GameRepository } from '../domain/game/gameRepository';
import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { toDisc } from '../domain/turn/disc';
import { Point } from '../domain/turn/point';
import { TurnRepository } from '../domain/turn/turnRepository';

const gameGateway = new GameGateway();
const turnRepository = new TurnRepository();
const gameRepository = new GameRepository();

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
      const game = await gameRepository.findLatest(conn);

      if (!game) throw new Error('Latest game not found');
      if (!game.id) throw new Error('game.id not exists');

      const turn = await turnRepository.findForGameIdAndTurnCount(conn, game.id, turnCount);

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

      const game = await gameRepository.findLatest(conn);

      if (!game) throw new Error('Latest game not found');
      if (!game.id) throw new Error('game.id not exists');

      const previousTurnCount = turnCount - 1;

      const previousTurn = await turnRepository.findForGameIdAndTurnCount(conn, game.id, previousTurnCount);

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

import { WinnerDisc } from './../../domain/model/gameResult/winnerDisc';
import { GameResultRepository } from './../../domain/model/gameResult/gameResultRepository';
import { GameRepository } from '../../domain/model/game/gameRepository';
import { connectMySql } from '../../infrastructure/connection';
import { Disc, toDisc } from '../../domain/model/turn/disc';
import { Point } from '../../domain/model/turn/point';
import { TurnRepository } from '../../domain/model/turn/turnRepository';
import { ApplicationError } from '../error/applicationError';
import { GameResult } from '../../domain/model/gameResult/gameResult';
import { gameMySQLRepository } from '../../infrastructure/repository/game/gameMySQLRepository';
import { GameResultMySQLRepository } from '../../infrastructure/repository/gameResult/gameResultMySQLRepository';
import { TurnMySQLRepository } from '../../infrastructure/repository/trun/turnMySQLRepository';

const turnRepository = new TurnMySQLRepository();
const gameRepository = new gameMySQLRepository();
const gameResultRepository = new GameResultMySQLRepository();

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

      if (!game) throw new ApplicationError('LatestGameNotFound', 'Latest game not found');
      if (!game.id) throw new Error('game.id not exists');

      const turn = await turnRepository.findForGameIdAndTurnCount(conn, game.id, turnCount);

      let gameResult: GameResult | undefined;

      if (turn.gameEnded()) {
        // 【未解決】endAtは入れなくていいの
        gameResult = await gameResultRepository.findForGameId(conn, game.id);
      }

      const responseBody = new findLatestTurnByTurnCountOutput(
        turnCount,
        turn.board.discs, //turn.boardではない。board.tsを参照する
        turn.nextDisc,
        gameResult?.winnerDisc
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

  async registerTurn(turnCount: number, disc: Disc, point: Point) {
    const conn = await connectMySql();

    try {
      await conn.beginTransaction();

      const game = await gameRepository.findLatest(conn);

      if (!game) throw new ApplicationError('LatestGameNotFound', 'Latest game not found');
      if (!game.id) throw new Error('game.id not exists');

      const previousTurnCount = turnCount - 1;

      const previousTurn = await turnRepository.findForGameIdAndTurnCount(conn, game.id, previousTurnCount);

      // 盤面に置けるかチェックする

      // 石を置く
      const newTurn = previousTurn.placeNext(disc, point);

      // ターンを保存する
      await turnRepository.save(conn, newTurn);

      // 勝敗が決した場合、対戦結果を保存する
      if (newTurn.gameEnded) {
        const winnerDisc = newTurn.winnerDisc();
        const gameResult = new GameResult(game.id, winnerDisc, new Date());
        await gameResultRepository.save(conn, gameResult);
      }

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}

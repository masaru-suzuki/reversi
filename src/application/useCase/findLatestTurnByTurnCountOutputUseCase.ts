import { GameResultRepository } from '../../domain/model/gameResult/gameResultRepository';
import { GameRepository } from '../../domain/model/game/gameRepository';
import { connectMySql } from '../../infrastructure/connection';
import { Disc } from '../../domain/model/turn/disc';
import { Point } from '../../domain/model/turn/point';
import { TurnRepository } from '../../domain/model/turn/turnRepository';
import { ApplicationError } from '../error/applicationError';
import { GameResult } from '../../domain/model/gameResult/gameResult';

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

export class FindLatestTurnByTurnCountOutputUseCase {
  constructor(
    private _turnRepository: TurnRepository,
    private _gameRepository: GameRepository,
    private _gameResultRepository: GameResultRepository
  ) {}

  async run(turnCount: number): Promise<findLatestTurnByTurnCountOutput> {
    const conn = await connectMySql();

    try {
      const game = await this._gameRepository.findLatest(conn);

      if (!game) throw new ApplicationError('LatestGameNotFound', 'Latest game not found');
      if (!game.id) throw new Error('game.id not exists');

      const turn = await this._turnRepository.findForGameIdAndTurnCount(conn, game.id, turnCount);

      let gameResult: GameResult | undefined;

      if (turn.gameEnded()) {
        // 【未解決】endAtは入れなくていいの
        gameResult = await this._gameResultRepository.findForGameId(conn, game.id);
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
}

import express from 'express';
import { DARK, LIGHT } from './constants';
import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { MoveGateway } from '../dataaccess/moveGateway';
import { SquareGateway } from '../dataaccess/squareGateway';
import { TurnGateway } from '../dataaccess/turnGateway';
import { Turn } from '../domain/turn';
import { toDisc } from '../domain/disc';
import { Board } from '../domain/board';
import { Point } from '../domain/point';

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

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

      const turnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, turnCount);

      console.log({ turnRecord });

      if (!turnRecord) {
        throw new Error('Specified turn not found');
      }

      const squareRecords = await squareGateway.findForTurnId(conn, turnRecord.id);

      const board = Array.from(Array(8)).map(() => Array(8));
      squareRecords.forEach((square) => {
        board[square.y][square.x] = square.disc;
      });

      const responseBody = new findLatestTurnByTurnCountOutput(
        turnCount,
        board,
        turnRecord.nextDisc,
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

      const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, previousTurnCount);

      if (!previousTurnRecord) {
        throw new Error('Specified turn not found');
      }

      const squareRecords = await squareGateway.findForTurnId(conn, previousTurnRecord.id);

      const board = Array.from(Array(8)).map(() => Array(8));
      squareRecords.forEach((square) => {
        board[square.y][square.x] = square.disc;
      });

      const previousTurn = new Turn(
        gameRecord.id,
        previousTurnCount,
        // previousTurnRecord.nextDisc, // これだとエラー。ここむずい！
        toDisc(previousTurnRecord.nextDisc), // disc.tsで定義した関数を使う。なんで？
        undefined, // moveはまだない
        new Board(board), // boardを直接渡すとエラーになるようにしている
        previousTurnRecord.endAt
      );

      // 盤面に置けるかチェックする

      // 石を置く
      const newTurn = previousTurn.placeNext(toDisc(disc), new Point(x, y));

      // ターンを保存する
      const turnRecord = await turnGateway.insert(
        conn,
        newTurn.gameId,
        newTurn.turnCount,
        newTurn.nextDisc,
        newTurn.endAt
      );

      await squareGateway.insertAll(conn, turnRecord.id, newTurn.board.discs);

      await moveGateway.insert(conn, turnRecord.id, disc, x, y);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}

import express from 'express';
import { DARK, LIGHT } from '../application/constants';
import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { MoveGateway } from '../dataaccess/moveGateway';
import { SquareGateway } from '../dataaccess/squareGateway';
import { TurnGateway } from '../dataaccess/turnGateway';

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

class findLatestTurnByTurnCountOutput {
  constructor(
    private _turnCount: number,
    private _board: number[][],
    private _nextDisc: number | null,
    private _winnerDisc: number | null
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
      const gameRecord = await gameGateway.findLatest(conn);

      if (!gameRecord) throw new Error('GameRecordが見つかりませんでした');

      const turnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, turnCount);

      const squareRecords = await squareGateway.findForTurnId(conn, turnRecord.id);

      const board = Array.from(Array(8)).map(() => Array(8));
      squareRecords.forEach((square) => {
        board[square.y][square.x] = square.disc;
      });

      const responseBody = new findLatestTurnByTurnCountOutput(turnCount, board, turnRecord.nextDisc, undefined);

      return responseBody;
      // サービスクラスでレスポンスを返すのはおかしいので、responseBodyを返す
      // レスポンスはプレゼンテーション層で行う
      // res.json(responseBody);
    } finally {
      // connectionの切断についてはサービスクラスで行ってもいい
      conn.end();
    }
  }

  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
    const conn = await connectMySql();

    try {
      await conn.beginTransaction();

      const gameRecord = await gameGateway.findLatest(conn);

      const previousTurnCount = turnCount - 1;

      const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, previousTurnCount);

      const squareRecords = await squareGateway.findForTurnId(conn, previousTurnRecord.id);

      const board = Array.from(Array(8)).map(() => Array(8));
      squareRecords.forEach((square) => {
        board[square.y][square.x] = square.disc;
      });

      // 盤面に置けるかチェックする

      // 石を置く

      board[y][x] = disc;

      // ひっくり返す

      // ターンを保存する
      const now = new Date();
      const nextDisc = disc === DARK ? LIGHT : DARK;
      const turnRecord = await turnGateway.insert(conn, gameRecord.id, turnCount, nextDisc, now);

      await squareGateway.insertAll(conn, turnRecord.id, board);

      moveGateway.insert(conn, turnRecord.id, disc, x, y);

      await conn.commit();
    } finally {
      conn.end();
    }
  }
}

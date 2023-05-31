import express from 'express';
import { DARK, INITIAL_BOARD } from '../application/constants';
import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { SquareGateway } from '../dataaccess/squareGateway';
import { TurnGateway } from '../dataaccess/turnGateway';

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const conn = await connectMySql();

    try {
      await conn.beginTransaction();

      const GameRecord = await gameGateway.insert(conn, now);

      const turnRecord = await turnGateway.insert(conn, GameRecord.id, 0, DARK, now);

      await squareGateway.insertAll(conn, turnRecord.id, INITIAL_BOARD);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}

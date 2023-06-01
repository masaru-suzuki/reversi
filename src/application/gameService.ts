import { TurnRepository } from './../domain/turnRepository';
import express from 'express';
import { DARK, INITIAL_BOARD } from './constants';
import { connectMySql } from '../dataaccess/connection';
import { GameGateway } from '../dataaccess/gameGateway';
import { SquareGateway } from '../dataaccess/squareGateway';
import { TurnGateway } from '../dataaccess/turnGateway';
import { Disc } from '../domain/disc';
import { Board } from '../domain/board';
import { Turn } from '../domain/turn';

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();
const turnRepository = new TurnRepository();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const conn = await connectMySql();

    try {
      await conn.beginTransaction();

      const GameRecord = await gameGateway.insert(conn, now);

      // ターンの初期化
      const firstTurn = new Turn(GameRecord.id, 0, Disc.DARK, undefined, new Board(INITIAL_BOARD), now);

      // ターンの保存
      await turnRepository.save(conn, firstTurn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}

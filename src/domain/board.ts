import { INITIAL_BOARD } from 'src/application/constants';
import { Disc } from './disc';
import { Move } from './move';

export class Board {
  constructor(private _discs: Disc[][]) {}

  place(move: Move): Board {
    // 盤面に石を置けるかチェックする

    // ボードをコピーする(バグに繋がらないようにするため)
    const newBoard = this._discs.map((line) => {
      return line.map((disc) => disc);
    });

    // 石を置く
    newBoard[move.point.y][move.point.x] = move.disc;

    // ひっくり返す

    // ボードを返す
    return new Board(newBoard);
  }

  get discs() {
    return this._discs;
  }
}

const E = Disc.EMPTY;
const D = Disc.DARK;
const L = Disc.LIGHT;

const INITIAL_DISCS = [
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, D, L, E, E, E],
  [E, E, E, L, D, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
];

// initial_boardはBoardクラスで保持するデータであって、直接INITIAL＿DISCSを参照するべきではないため、インスタンス化している
export const initial_board = new Board(INITIAL_DISCS);

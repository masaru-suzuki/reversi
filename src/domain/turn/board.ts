import { Disc } from './disc';
import { Move } from './move';

export class Board {
  constructor(private _discs: Disc[][]) {}

  place(move: Move): Board {
    // すでに石が置いてある場合、置けない(からのマス目ではない場合、置けない)
    if (this._discs[move.point.y][move.point.x] !== Disc.EMPTY)
      throw new Error('すでに石が置いてある場所には置けません');

    // 石をひっくり返せる点をリストアップする
    const flipPoints = this.listFlipPoints(move);

    // 石をひっくり返せる点がない場合、置けない
    if (flipPoints.length === 0) throw new Error('石をひっくり返せる点がありません');

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

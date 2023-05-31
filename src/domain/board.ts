import { Disc } from './disk';
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
}

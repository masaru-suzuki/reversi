import { Disc, isOpposite } from './disc';
import { Move } from './move';
import { Point } from './point';

export class Board {
  private _walledDiscs: Disc[][];
  constructor(private _discs: Disc[][]) {
    this._walledDiscs = this.wallDiscs();
  }

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

  private listFlipPoints(move: Move): Point[] {
    // 置いた石から斜めの8方向に向かって反対の色の石がある限り見ていく。
    // 反対の石がなくなった時に、自分の色の石であれば間の石をひっくり返す

    const flipPoints: Point[] = [];

    //
    const walledX = move.point.x + 1;
    const walledY = move.point.y + 1;

    // 上方向の処理をする
    const flipCandidate: Point[] = [];

    // 1つ動いた位置から開始する
    let cursorX = walledX;
    let cursorY = walledY - 1;

    // 手と逆の石がある間1つずつ上に移動する
    while (isOpposite(move.disc, this._walledDiscs[cursorY][cursorX])) {
      console.log(move.disc, this._walledDiscs[cursorY][cursorX]);

      // 盤兵を考慮して-１する
      flipCandidate.push(new Point(cursorX - 1, cursorY - 1));

      // 1つ上に移動する
      cursorY--;

      // 次の手が同じ色なら、ひっくり返す石が確定する
      if (move.disc === this._walledDiscs[cursorY][cursorX]) {
        flipPoints.push(...flipCandidate);
        break;
      }
    }

    return flipPoints;
  }

  // マス目を壁で囲んだ盤面を返す
  private wallDiscs(): Disc[][] {
    const walled: Disc[][] = [];

    // 上と下の壁
    const topAndBottomWall = Array(this._discs[0].length + 2).fill(Disc.WALL);

    walled.push(topAndBottomWall);

    // 真ん中の盤面
    this._discs.forEach((line) => {
      // 左右が壁で囲まれたライン
      const walledLine = [Disc.WALL, ...line, Disc.WALL];
      walled.push(walledLine);
    });

    // 下の壁
    walled.push(topAndBottomWall);

    return walled;
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

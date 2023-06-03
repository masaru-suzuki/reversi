import { DomainError } from '../../error/domainError';
import { Disc, isOpposite } from './disc';
import { Move } from './move';
import { Point } from './point';

export class Board {
  // 盤兵を作ることで、配列の長さを考慮せず、ロジックが組める。
  // 配列の長さを超えない限りwhile文で処理を回すが、方向性によって処理が複雑になるため、盤兵を作ることで、配列の長さを考慮せず、ロジックが組める。
  private _walledDiscs: Disc[][];

  constructor(private _discs: Disc[][]) {
    this._walledDiscs = this.wallDiscs();
  }

  place(move: Move): Board {
    // すでに石が置いてある場合、置けない(からのマス目ではない場合、置けない)
    if (this._discs[move.point.y][move.point.x] !== Disc.EMPTY)
      throw new DomainError('SelectedPointIsNotEmpty', 'すでに石が置いてある場所には置けません');

    // 石をひっくり返せる点をリストアップする
    const flipPoints = this.listFlipPoints(move);

    // 石をひっくり返せる点がない場合、置けない
    if (flipPoints.length === 0) throw new DomainError('FlipPointsIsEmpty', '石をひっくり返せる点がありません');

    // ボードをコピーする(バグに繋がらないようにするため)
    const newBoard = this._discs.map((line) => {
      return line.map((disc) => disc);
    });

    // 石を置く
    newBoard[move.point.y][move.point.x] = move.disc;

    // ひっくり返す
    flipPoints.forEach((point) => {
      newBoard[point.y][point.x] = move.disc;
    });

    // ボードを返す
    return new Board(newBoard);
  }

  private listFlipPoints(move: Move): Point[] {
    // 置いた石から斜めの8方向に向かって反対の色の石がある限り見ていく。
    // 反対の石がなくなった時に、自分の色の石であれば間の石をひっくり返す

    const flipPoints: Point[] = [];

    // 壁を考慮した座標を計算する
    const walledX = move.point.x + 1;
    const walledY = move.point.y + 1;

    // ひっくり返せる石を探す
    // ロジックちょっとわかっていない。
    const checkFlipPoints = (xMove: number, yMove: number) => {
      const flipCandidate: Point[] = [];

      // 1つ動いた位置から開始する
      let cursorX = walledX + xMove;
      let cursorY = walledY + yMove;

      // 手と逆の石がある間1つずつ上に移動する
      while (isOpposite(move.disc, this._walledDiscs[cursorY][cursorX])) {
        console.log(move.disc, this._walledDiscs[cursorY][cursorX]);

        // 盤兵を考慮して-１する
        flipCandidate.push(new Point(cursorX - 1, cursorY - 1));

        // 1つ上に移動する
        cursorX += xMove;
        cursorY += yMove;

        // 次の手が同じ色なら、ひっくり返す石が確定する
        if (move.disc === this._walledDiscs[cursorY][cursorX]) {
          flipPoints.push(...flipCandidate);
          break;
        }
      }
    };

    // 8方向に対してひっくり返せる石を探す
    checkFlipPoints(0, -1); // 上
    checkFlipPoints(0, 1); // 下
    checkFlipPoints(-1, 0); // 左
    checkFlipPoints(1, 0); // 右
    checkFlipPoints(1, 1); // 右下
    checkFlipPoints(1, -1); // 右上
    checkFlipPoints(-1, 1); // 左下
    checkFlipPoints(-1, -1); // 左上

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

  existValidMove(disc: Disc): boolean {
    for (let y = 0; y < this._discs.length; y++) {
      const line = this._discs[y];

      for (let x = 0; x < line.length; x++) {
        const discOnBoard = this._discs[y][x];

        // すでに石が置いてある場合は無視
        if (discOnBoard !== Disc.EMPTY) continue;

        const move = new Move(disc, new Point(x, y));
        const flipPoints = this.listFlipPoints(move);

        // ひっくり返せる点がある場合、おける場所がある
        if (flipPoints.length > 0) return true;
      }
    }

    return false;
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

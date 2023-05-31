import { Board } from './board';
import { Disc } from './disc';
import { Move } from './move';
import { Point } from './point';

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: Disc,
    private _move: Move | undefined,
    private _board: Board,
    private _endAt: Date
  ) {}

  placeNext(disc: Disc, point: Point): Turn {
    // TODO: 次の石ではない場合は、エラーを返す
    if (disc !== this._nextDisc) {
      throw new Error('次の石ではありません');
    }

    const move = new Move(disc, point);

    const newBoard = this._board.place(move);

    // TODO: 石を置けない場合はスキップする
    const nextDisc = this._nextDisc === Disc.DARK ? Disc.LIGHT : Disc.DARK;

    return new Turn(this._gameId, this._turnCount + 1, nextDisc, move, newBoard, new Date());
  }

  get gameId() {
    return this._gameId;
  }

  get turnCount() {
    return this._turnCount;
  }

  get nextDisc() {
    return this._nextDisc;
  }

  get endAt() {
    return this._endAt;
  }

  get board() {
    return this._board;
  }
}

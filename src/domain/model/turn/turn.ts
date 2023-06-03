import { DomainError } from '../../error/domainError';
import { Board, initial_board } from './board';
import { Disc } from './disc';
import { Move } from './move';
import { Point } from './point';
import { WinnerDisc } from '../gameResult/winnerDisc';

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: Disc | undefined,
    private _move: Move | undefined,
    private _board: Board,
    private _endAt: Date
  ) {}

  placeNext(disc: Disc, point: Point): Turn {
    // 打とうとした石が次の石ではない場合、エラーを返す
    if (disc !== this._nextDisc) {
      throw new DomainError('SelectedDiscIsNotNextDisc', '次の石ではありません');
    }

    const move = new Move(disc, point);

    const newBoard = this._board.place(move);

    // TODO: 石を置けない場合はスキップする
    const nextDisc = this.decideNextDisc(newBoard, disc);

    return new Turn(this._gameId, this._turnCount + 1, nextDisc, move, newBoard, new Date());
  }

  gameEnded(): boolean {
    return this._nextDisc === undefined;
  }

  winnerDisc(): WinnerDisc {
    const darkCount = this._board.countDiscs(Disc.DARK);
    const lightCount = this._board.countDiscs(Disc.LIGHT);

    if (darkCount === lightCount) {
      return WinnerDisc.DRAW;
    } else if (darkCount > lightCount) {
      return WinnerDisc.DARK;
    } else {
      return WinnerDisc.LIGHT;
    }
  }

  private decideNextDisc(board: Board, disc: Disc): Disc {
    const existDarkValidMove = board.existValidMove(Disc.DARK);
    const existLightValidMove = board.existValidMove(Disc.LIGHT);

    if (existDarkValidMove && existLightValidMove) {
      // 両方置ける場合は前の石と反対の色
      return disc === Disc.DARK ? Disc.LIGHT : Disc.DARK;
    } else if (!existDarkValidMove && !existLightValidMove) {
      // どちらも置けない場合、次の石はない
      return undefined;
    } else if (existDarkValidMove) {
      return Disc.DARK;
    } else {
      return Disc.LIGHT;
    }
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

  get move() {
    return this._move;
  }

  get board() {
    return this._board;
  }
}

// gameServiceにあったfirstTurnの知識はユースケース層で扱うものではない。domain層に移動した。
export const firstTurn = (gameId: number, endAt: Date): Turn =>
  new Turn(gameId, 0, Disc.DARK, undefined, initial_board, endAt);

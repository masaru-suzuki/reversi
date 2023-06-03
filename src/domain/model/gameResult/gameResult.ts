import { WinnerDisc } from './winnerDisc';

export class GameResult {
  constructor(private _gameId: number, private _winnerDisc: WinnerDisc, private _endAt: Date) {}

  get winnerDisc() {
    return this._winnerDisc;
  }
}

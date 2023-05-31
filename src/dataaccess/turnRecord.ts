export class TurnRecord {
  constructor(
    private _id: number,
    private _gameId: number,
    private _turnCount: number,
    private _nextDisk: number,
    private _endAt: Date
  ) {}

  get id() {
    return this._id;
  }

  get nextDisc() {
    return this._nextDisk;
  }

  get endAt() {
    return this._endAt;
  }
}

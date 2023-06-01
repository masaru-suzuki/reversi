export class GameRecord {
  constructor(private _id: number, private _startedAt: Date) {}

  get id() {
    // ? startedAtは返さないの？
    // 入れ物のクラス
    // なぜ作るの？
    return this._id;
  }

  get startedAt() {
    return this._startedAt;
  }
}

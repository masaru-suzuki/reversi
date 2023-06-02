// er.drawio を参考
export class Game {
  constructor(private _id: number, private _startedAt: Date) {}

  get id() {
    return this._id;
  }

  get startedAt() {
    return this._startedAt;
  }
}

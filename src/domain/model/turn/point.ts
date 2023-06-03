import { DomainError } from '../../error/domainError';

const MIN_POINT = 0;
const MAX_POINT = 7;

export class Point {
  constructor(private _x: number, private _y: number) {
    // MEMO: 初期化時に座標のバリデーションを行う
    if (_x < MIN_POINT || _x > MAX_POINT || _y < MIN_POINT || _y > MAX_POINT) {
      throw new DomainError('InvalidPoint', '座標が不正です');
    }
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }
}

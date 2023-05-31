import { Disc } from './disk';
import { Point } from './point';

export class Move {
  constructor(private _disc: Disc, private _point: Point) {}
}

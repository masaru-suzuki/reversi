import { DomainError } from '../../error/domainError';

export const Disc = {
  EMPTY: 0,
  DARK: 1,
  LIGHT: 2,
  WALL: 3,
} as const;

export type Disc = (typeof Disc)[keyof typeof Disc];

export const toDisc = (value: any): Disc => {
  if (!Object.values(Disc).includes(value)) {
    throw new DomainError('InvalidDiscValue', '石が不正です');
  }
  //TODO: 無理やり変換したから、後で改善する
  return value as Disc;
};

export const isOpposite = (disc1: Disc, disc2: Disc): boolean => {
  return (disc1 === Disc.DARK && disc2 === Disc.LIGHT) || (disc1 === Disc.LIGHT && disc2 === Disc.DARK);
};

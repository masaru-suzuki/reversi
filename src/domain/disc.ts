export const Disc = {
  EMPTY: 0,
  DARK: 1,
  LIGHT: 2,
} as const;

export type Disc = (typeof Disc)[keyof typeof Disc];

export const toDisc = (value: number): Disc => {
  //TODO: 無理やり変換したから、後で改善する
  return value as Disc;
};

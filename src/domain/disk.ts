import { EMPTY } from '../application/constants';
export const Disc = {
  EMPTY: 0,
  DARK: 1,
  LIGHT: 2,
} as const;

export type Disc = (typeof Disc)[keyof typeof Disc];

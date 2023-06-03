export const WinnerDisc = {
  DRAW: 0,
  DARK: 1,
  LIGHT: 2,
} as const;

export type WinnerDisc = (typeof WinnerDisc)[keyof typeof WinnerDisc];

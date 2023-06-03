import { DomainError } from '../../error/domainError';

export const WinnerDisc = {
  DRAW: 0,
  DARK: 1,
  LIGHT: 2,
} as const;

export type WinnerDisc = (typeof WinnerDisc)[keyof typeof WinnerDisc];

export const toWinnerDisc = (value: any): WinnerDisc => {
  if (!Object.values(WinnerDisc).includes(value)) {
    throw new DomainError('InvalidWinnerDiscValue', 'Invalid Winner disc value');
  }

  return value as WinnerDisc;
};

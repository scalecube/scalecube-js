import { saveToLogs } from '@scalecube/utils';

export const loggerUtil = (whoAmI: string, debug: boolean) => (msg: any, type: 'log' | 'warn') => {
  saveToLogs(whoAmI, msg, {}, debug, type);
};

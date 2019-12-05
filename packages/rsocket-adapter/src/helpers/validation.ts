import { check } from '@scalecube/utils';

export const validateClientProvider = (provider: any) => validateProvider(provider, 'RsocketClient');
export const validateServerProvider = (provider: any) => validateProvider(provider, 'RsocketServer');

export const validateProvider = (provider: any, name: string) => {
  check.assertDefined(provider, `Must provide ${name} provider`);

  check.assertFunction(provider, `${name} provider invalid, expect a function be receive ${typeof provider}`);
};

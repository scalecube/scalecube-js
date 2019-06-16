import { Address } from '@scalecube/api';
import * as check from './check';
import { NOT_VALID_ADDRESS, NOT_VALID_HOST, NOT_VALID_PATH, NOT_VALID_PORT, NOT_VALID_PROTOCOL } from './constants';

export const validateAddress = (address: any, isOptional: boolean = true) => {
  if (isOptional && typeof address === 'undefined') {
    return;
  }

  check.assertNonEmptyObject(address, NOT_VALID_ADDRESS);

  const { host, path, port, protocol } = address;

  check.assertString(host, NOT_VALID_HOST);
  check.assertString(path, NOT_VALID_PATH);
  check.assertNumber(port, NOT_VALID_PORT);
  check.assertString(protocol, NOT_VALID_PROTOCOL);
  check.assert(check.isOneOf(['pm', 'ws', 'wss', 'tcp'], protocol), NOT_VALID_PROTOCOL);
};

/**
 * address is <protocol>://<host>:<port>/<path>
 */
export const getFullAddress = (address: Address) => {
  validateAddress(address, false);
  const { host, path, port, protocol } = address;
  return `${protocol}://${host}:${port}/${path}`;
};

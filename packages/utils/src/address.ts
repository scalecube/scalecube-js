import { Address } from '@scalecube/api';
import * as check from './check';
import { NOT_VALID_ADDRESS, NOT_VALID_HOST, NOT_VALID_PATH, NOT_VALID_PORT, NOT_VALID_PROTOCOL } from './constants';

export const validateAddress = (address: any, isOptional: boolean = true) => {
  if (isOptional && typeof address === 'undefined') {
    return true;
  }

  check.assertNonEmptyObject(address, NOT_VALID_ADDRESS);

  const { host, path, port, protocol } = address;

  check.assertString(host, NOT_VALID_HOST);
  check.assertString(path, NOT_VALID_PATH);
  check.assertNumber(port, NOT_VALID_PORT);
  check.assertString(protocol, NOT_VALID_PROTOCOL);
  check.assert(check.isOneOf(['pm', 'ws', 'wss', 'tcp'], protocol), NOT_VALID_PROTOCOL);

  return true;
};

/**
 * address is <protocol>://<host>:<port>/<path>
 */
export const getFullAddress = (address: Address) => {
  validateAddress(address, false);
  const { host, path, port, protocol } = address;
  return `${protocol}://${host}:${port}/${path}`;
};

export const getAddress = (address: string): Address => {
  const newAddress: { [key: string]: any } = {};
  address = buildAddress({ key: 'protocol', optionalValue: 'pm', delimiter: '://', str: address, newAddress });
  address = buildAddress({ key: 'host', optionalValue: 'defaultHost', delimiter: ':', str: address, newAddress });
  address = buildAddress({ key: 'port', optionalValue: 8080, delimiter: '/', str: address, newAddress });
  newAddress.path = address;

  return newAddress as Address;
};

const buildAddress = ({
  key,
  optionalValue,
  delimiter,
  newAddress,
  str,
}: {
  optionalValue: string | number;
  delimiter: string;
  str: string;
  newAddress: { [key: string]: any };
  key: string;
}) => {
  let [v1, rest]: any = str.split(delimiter);
  if (!rest) {
    rest = v1;
    v1 = optionalValue;
  }

  newAddress[key] = v1;
  return rest;
};

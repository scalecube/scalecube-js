import * as check from './check';
import { NOT_VALID_ADDRESS, NOT_VALID_HOST, NOT_VALID_PATH, NOT_VALID_PORT, NOT_VALID_PROTOCOL } from './constants';

export const validateAddress = (address: any) => {
  check.assertNonEmptyObject(address, NOT_VALID_ADDRESS);
  const { protocol, host, path, port } = address;
  check.assertNonEmptyString(protocol, NOT_VALID_PROTOCOL);
  check.assertString(host, NOT_VALID_HOST);
  check.assertString(path, NOT_VALID_PATH);
  check.assertNumber(port, NOT_VALID_PORT);
};

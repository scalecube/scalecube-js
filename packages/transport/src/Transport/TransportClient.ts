import { Address } from '../api';
// @ts-ignore
import RSocketEventsClient from 'rsocket-events-client';
// @ts-ignore
import { RSocketClient } from 'rsocket-core';
import { NOT_IMPLEMENTED_YET, NOT_VALID_PROTOCOL } from '../helpers/constants';

export const transportClientProviderCallback = ({
  address,
  remoteTransportClientProviderOptions,
}: {
  address: Address;
  remoteTransportClientProviderOptions: any;
}) => {
  const { protocol, host, path, port } = address;
  switch (protocol) {
    case 'pm':
      return new RSocketEventsClient({ address: `${protocol}://${host}:${port}/${path}` });
    case 'ws':
      // TODO: rsocket ws client
      throw Error(NOT_IMPLEMENTED_YET);
    case 'https':
    case 'http':
      // TODO rsocket tcp client
      throw Error(NOT_IMPLEMENTED_YET);
    default:
      throw Error(NOT_VALID_PROTOCOL);
  }
};

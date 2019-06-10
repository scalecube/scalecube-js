// @ts-ignore
import RSocketEventsServer from 'rsocket-events-server';
// @ts-ignore
import { TransportServer } from 'rsocket-core';
import { Address } from '../api';
import { NOT_IMPLEMENTED_YET, NOT_VALID_PROTOCOL } from '../helpers/constants';

export const transportServerProviderCallback = ({
  address,
  remoteTransportServerProviderOptions,
}: {
  address: Address;
  remoteTransportServerProviderOptions: any;
}): TransportServer => {
  const { protocol, host, path, port } = address;
  switch (protocol) {
    case 'pm':
      return new RSocketEventsServer({ address: `${protocol}://${host}:${port}/${path}` });
    case 'ws':
      // TODO: rsocket ws server
      throw Error(NOT_IMPLEMENTED_YET);
    case 'https':
    case 'http':
      // TODO rsocket tcp server
      throw Error(NOT_IMPLEMENTED_YET);
    default:
      throw Error(NOT_VALID_PROTOCOL);
  }
};

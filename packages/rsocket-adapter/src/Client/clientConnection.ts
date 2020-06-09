// @ts-ignore
import RSocketClient from 'rsocket-core/build/RSocketClient';
// @ts-ignore
import { ReactiveSocket } from 'rsocket-types';
import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';
import { getSerializers, getSetup } from '../helpers/defaultConfiguration';
import { ConnectionManager } from '../helpers/types';
import { Provider } from '..';

export const getClientConnection = ({
  address,
  clientProvider,
  connectionManager,
}: {
  address: Address;
  clientProvider: Provider;
  connectionManager: ConnectionManager;
}) => {
  const fullAddress = getFullAddress(address);

  let connection: Promise<ReactiveSocket> = connectionManager.getConnection(fullAddress);

  if (!connection) {
    const client = createClient({ address, clientProvider });
    connection = new Promise((resolve, reject) => {
      client.connect().subscribe({
        onComplete: (socket: ReactiveSocket) => resolve(socket),
        onError: (error: Error) => reject(error),
      });
    });
    connectionManager.setConnection(fullAddress, connection);
  }

  return connection;
};

const createClient = ({ address, clientProvider }: { address: Address; clientProvider: any }) => {
  const { factoryOptions, providerFactory } = clientProvider;

  const serializers = clientProvider.serializers || getSerializers();
  const setup = clientProvider.setup ? getSetup(clientProvider.setup) : getSetup({});

  return new RSocketClient({
    serializers,
    setup,
    transport: providerFactory({ address, factoryOptions }),
  });
};

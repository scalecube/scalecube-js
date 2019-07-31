import { TransportApi, Address, MicroserviceApi } from '@scalecube/api';
// @ts-ignore
import { RSocketClient, DuplexConnection, RSocketClientSocket } from 'rsocket-core';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
// @ts-ignore
import { ISubscription } from 'rsocket-types';

import { getFullAddress, saveToLogs } from '@scalecube/utils';
import { Observable } from 'rxjs';
import { MicroserviceContext, RsocketEventsPayload } from '../helpers/types';
import { ASYNC_MODEL_TYPES } from '..';
import { RSocketConnectionStatus } from '../helpers/constants';

export const remoteResponse = ({
  address,
  asyncModel,
  message,
  transportClientProvider,
  microserviceContext,
}: {
  address: Address;
  asyncModel: string;
  message: MicroserviceApi.Message;
  transportClientProvider: TransportApi.ClientProvider;
  microserviceContext: MicroserviceContext;
}) => {
  return new Observable((observer) => {
    const connection: Promise<RSocketClientSocket> = getClientConnection({
      address,
      transportClientProvider,
      microserviceContext,
    });

    connection.then((socket: RSocketClientSocket) => {
      const socketConnect: Single | Flowable = socket[asyncModel]({
        data: message,
        metadata: '',
      });

      const flowableNext = ({ data, metadata }: RsocketEventsPayload) => {
        const { data: response } = data;
        observer.next(response);
      };
      const flowableError = (err: { source: { message: string } }) =>
        observer.error(
          err ? (err.source ? new Error(err.source.message) : err) : new Error('RemoteCall exception occur.')
        );

      switch (asyncModel) {
        case ASYNC_MODEL_TYPES.REQUEST_RESPONSE:
          socketConnect.subscribe({
            onComplete: flowableNext,
            onError: flowableError,
          }); // Single type
          break;

        case ASYNC_MODEL_TYPES.REQUEST_STREAM:
          const max = socketConnect._max;
          socketConnect.subscribe({
            onNext: flowableNext,
            onError: flowableError,
            onComplete: () => observer.complete(),
            onSubscribe(subscription: ISubscription) {
              subscription.request(max);
            },
          }); // Flowable type
          break;

        default:
          observer.error(new Error('Unable to find asyncModel'));
      }

      socket.connectionStatus().subscribe(({ kind, error }: { kind: string; error?: Error }) => {
        if (kind.toUpperCase() === RSocketConnectionStatus.ERROR) {
          destoryClientConnection(getFullAddress(address), microserviceContext);
          observer.error(error);
        }
      });
    });
  });
};

const getClientConnection = ({
  address,
  transportClientProvider,
  microserviceContext,
}: {
  address: Address;
  transportClientProvider: TransportApi.ClientProvider;
  microserviceContext: MicroserviceContext;
}) => {
  const fullAddress = getFullAddress(address);
  const { connectionManager } = microserviceContext;
  let connection: Promise<RSocketClientSocket> = connectionManager.getConnection(fullAddress);

  if (!connection) {
    const client = createClient({ address, transportClientProvider });
    connection = new Promise((resolve, reject) => {
      client.connect().subscribe({
        onComplete: (socket: RSocketClientSocket) => resolve(socket),
        onError: (error: Error) => reject(error),
      });
    });
    connectionManager.setConnection(fullAddress, connection);
  }

  return connection;
};

const createClient = ({
  address,
  transportClientProvider,
}: {
  address: Address;
  transportClientProvider: TransportApi.ClientProvider;
}) => {
  const { factoryOptions, clientFactory, serializers } = transportClientProvider;

  return new RSocketClient({
    serializers,
    setup: {
      dataMimeType: 'text/plain',
      keepAlive: 1000000,
      lifetime: 1000000,
      metadataMimeType: 'text/plain',
    },
    transport: clientFactory({ address, factoryOptions }),
  });
};

export const destoryClientConnection = (fullAddress: string, microserviceContext: MicroserviceContext) => {
  const { connectionManager, whoAmI, debug } = microserviceContext;
  const connection = connectionManager.getConnection(fullAddress);
  if (connection) {
    connection.then((socket: RSocketClientSocket) => {
      try {
        socket.close();
      } catch (e) {
        saveToLogs(whoAmI, `RSocket unable to close connection ${e}`, {}, debug, 'warn');
      }
      connectionManager.removeConnection(fullAddress);
    });
  }
};

export const destroyAllClientConnections = (microserviceContext: MicroserviceContext) => {
  const { connectionManager } = microserviceContext;
  Object.keys(connectionManager.getAllConnections()).forEach((key) =>
    destoryClientConnection(key, microserviceContext)
  );
};

import { TransportApi, Address, MicroserviceApi } from '@scalecube/api';
// @ts-ignore
import RSocketClient from 'rsocket-core/build/RSocketClient';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
// @ts-ignore
import { ISubscription, ReactiveSocket, DuplexConnection } from 'rsocket-types';

import { getFullAddress, saveToLogs } from '@scalecube/utils';
import { Observable } from 'rxjs';
import { MicroserviceContext, RsocketEventsPayload } from '../helpers/types';
import { RSocketConnectionStatus, ASYNC_MODEL_TYPES } from '../helpers/constants';

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
  transportClientProvider: TransportApi.Provider;
  microserviceContext: MicroserviceContext;
}) => {
  return new Observable((observer) => {
    const connection: Promise<ReactiveSocket> = getClientConnection({
      address,
      transportClientProvider,
      microserviceContext,
    });

    connection.then((socket: ReactiveSocket) => {
      const socketConnect: Single | Flowable = socket[asyncModel]({
        data: message,
        metadata: '',
      });

      const flowableNext = ({ data, metadata }: RsocketEventsPayload) => {
        observer.next(data);
      };

      const flowableError = (err: { source: any }) => {
        if (err && err.source) {
          const { metadata, data } = err.source.message;
          observer.error(metadata.isErrorFormat === true ? new Error(data) : data);
        } else {
          observer.error(new Error('RemoteCall exception occur.'));
        }
      };

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
  transportClientProvider: TransportApi.Provider;
  microserviceContext: MicroserviceContext;
}) => {
  const fullAddress = getFullAddress(address);
  const { connectionManager } = microserviceContext;
  let connection: Promise<ReactiveSocket> = connectionManager.getConnection(fullAddress);

  if (!connection) {
    const client = createClient({ address, transportClientProvider });
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

const createClient = ({
  address,
  transportClientProvider,
}: {
  address: Address;
  transportClientProvider: TransportApi.Provider;
}) => {
  const { factoryOptions, providerFactory, serializers, setup } = transportClientProvider;

  return new RSocketClient({
    serializers,
    setup: {
      dataMimeType: (setup && setup.dataMimeType) || 'text/plain',
      keepAlive: (setup && setup.keepAlive) || 1000000,
      lifetime: (setup && setup.lifetime) || 1000000,
      metadataMimeType: (setup && setup.metadataMimeType) || 'text/plain',
    },
    transport: providerFactory({ address, factoryOptions }),
  });
};

export const destoryClientConnection = (fullAddress: string, microserviceContext: MicroserviceContext) => {
  const { connectionManager, whoAmI, debug } = microserviceContext;
  const connection = connectionManager.getConnection(fullAddress);
  if (connection) {
    connection.then((socket: ReactiveSocket) => {
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

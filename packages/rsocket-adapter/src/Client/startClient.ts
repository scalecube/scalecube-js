// @ts-ignore
import { ISubscription, ReactiveSocket, DuplexConnection } from 'rsocket-types';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { MicroserviceApi, TransportApi } from '@scalecube/api';
import { Observable } from 'rxjs';
import { getClientConnection } from './clientConnection';
import { RsocketEventsPayload } from '../helpers/types';
import { createConnectionManager } from './connectionManager';
import { validateClientProvider } from '../helpers/validation';
import { CLIENT_NOT_IMPL } from '../helpers/constants';

export const setupClient = (configuration: any) => {
  const clientProvider = {
    factoryOptions: null,
    providerFactory: () => {
      throw new Error(CLIENT_NOT_IMPL);
    },
    ...configuration,
  };
  validateClientProvider(clientProvider.providerFactory);

  const connectionManager = createConnectionManager();

  const destroy: TransportApi.TDestroy = (options: TransportApi.TDestroyOptions) => {
    const { address, logger } = options;
    const connection = connectionManager.getConnection(address);
    if (connection) {
      connection.then((socketToClose: ReactiveSocket) => {
        try {
          socketToClose.close();
        } catch (e) {
          logger(`RSocket unable to close connection ${e}`, 'warn');
        }
        connectionManager.removeConnection(address);
      });
    }
  };

  return {
    start: async (options: TransportApi.ClientTransportOptions): Promise<TransportApi.Invoker> => {
      const { remoteAddress, logger } = options;

      const socket = await getClientConnection({
        address: remoteAddress,
        clientProvider,
        connectionManager,
      });

      return {
        requestResponse: (message: MicroserviceApi.Message) => {
          return new Promise((resolve, reject) => {
            const socketConnect: Single = socket.requestResponse({
              data: message,
              metadata: '',
            });

            socketConnect.subscribe({
              onComplete: ({ data, metadata }: RsocketEventsPayload) => resolve(data),
              onError: (err: { source: { message: string } }) => {
                handleErrors({ rejectFn: (errMsg: any) => reject(errMsg), err, message, logger });
              },
            });
          });
        },
        requestStream: (message: MicroserviceApi.Message) => {
          const socketConnect: Flowable = socket.requestStream({
            data: message,
            metadata: '',
          });
          const max = socketConnect._max;

          return new Observable((obs) => {
            socketConnect.subscribe({
              onNext: ({ data, metadata }: RsocketEventsPayload) => obs.next(data),
              onError: (err: { source: { message: string } }) => {
                handleErrors({ rejectFn: (errMsg: any) => obs.error(errMsg), err, message, logger });
              },
              onComplete: () => obs.complete(),
              onSubscribe(subscription: ISubscription) {
                subscription.request(max);
              },
            });
          });
        },
      };
    },
    destroy,
  };
};

const handleErrors = ({
  rejectFn,
  err,
  logger,
  message,
}: {
  rejectFn: any;
  err: { source: any };
  logger: TransportApi.TLogger;
  message: { qualifier: string; data: any };
}) => {
  if (err && err.source && err.source.message) {
    const { metadata, data } = err.source.message;
    logger(`remoteCall to ${message.qualifier} with data ${message.data} error ${data}`, 'log');

    rejectFn(metadata && metadata.isErrorFormat === true ? new Error(data) : data);
  } else {
    rejectFn(new Error('RemoteCall exception occur.'));
  }
};

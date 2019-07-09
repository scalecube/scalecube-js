import { Address, TransportApi, MicroserviceApi } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';
import { Observable } from 'rxjs';
import { RemoteCallOptions, RsocketEventsPayload } from '../helpers/types';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { getNotFoundByRouterError, ASYNC_MODEL_TYPES, RSocketConnectionStatus } from '../helpers/constants';
import { createClient } from '../TransportProviders/MicroserviceClient';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
// @ts-ignore
import { RSocketClientSocket } from 'rsocket-core';
// @ts-ignore
import { ISubscription } from 'rsocket-types';

export const remoteCall = ({
  router,
  microserviceContext,
  message,
  asyncModel,
  openConnections,
  transportClientProvider,
}: RemoteCallOptions): Observable<any> => {
  const endPoint: MicroserviceApi.Endpoint | null = router.route({
    lookUp: microserviceContext.serviceRegistry.lookUp,
    message,
  });
  if (!endPoint) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: getNotFoundByRouterError(message.qualifier),
    }) as Observable<any>;
  }
  const { asyncModel: asyncModelProvider } = endPoint!;

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: `asyncModel is not correct, expected ${asyncModel} but received ${asyncModelProvider}`,
    }) as Observable<any>;
  }

  return remoteResponse({ address: endPoint.address, asyncModel, message, openConnections, transportClientProvider });
};

const remoteResponse = ({
  address,
  asyncModel,
  message,
  openConnections,
  transportClientProvider,
}: {
  address: Address;
  asyncModel: string;
  message: MicroserviceApi.Message;
  openConnections: { [key: string]: any };
  transportClientProvider: TransportApi.ClientProvider;
}) => {
  return new Observable((observer) => {
    let connection: Promise<RSocketClientSocket>;
    const fullAddress = getFullAddress(address);
    if (!openConnections[fullAddress]) {
      const client = createClient({ address, transportClientProvider });
      connection = new Promise((resolve, reject) => {
        client.connect().subscribe({
          onComplete: (socket: RSocketClientSocket) => resolve(socket),
          onError: (error: Error) => observer.error(error),
        });
      });
      openConnections[fullAddress] = connection;
    } else {
      connection = openConnections[fullAddress];
    }

    connection.then((socket: RSocketClientSocket) => {
      const serializeData = JSON.stringify(message);
      const socketConnect: Single | Flowable = socket[asyncModel]({
        data: serializeData,
        metadata: '',
      });

      const flowableNext = (response: RsocketEventsPayload) => {
        try {
          const { data } = JSON.parse(response && response.data);
          observer.next(data);
        } catch (parseError) {
          observer.error(new Error(`RemoteCall ${asyncModel} response, parsing error: ${parseError}`));
        }
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
          openConnections[fullAddress] = null;
          observer.error(error);
        }

        if (kind.toUpperCase() === RSocketConnectionStatus.CLOSED) {
          openConnections[fullAddress] = null;
        }
      });
    });
  });
};

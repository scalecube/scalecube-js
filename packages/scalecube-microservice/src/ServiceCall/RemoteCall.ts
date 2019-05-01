import { Observable } from 'rxjs';
import { RemoteCallOptions, RsocketEventsPayload } from '../helpers/types';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { Endpoint, Message } from '../api';
import { getNotFoundByRouterError, ASYNC_MODEL_TYPES, RSocketConnectionStatus } from '../helpers/constants';
import { CreateClient } from '../TransportProviders/MicroserviceClient';

export const remoteCall = ({
  router,
  microserviceContext,
  message,
  asyncModel,
  openConnections,
}: RemoteCallOptions): Observable<any> => {
  const endPoint: Endpoint | null = router.route({ lookUp: microserviceContext.serviceRegistry.lookUp, message });
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

  return remoteResponse({ address: endPoint.address, asyncModel, message, openConnections });
};

const remoteResponse = ({
  address,
  asyncModel,
  message,
  openConnections,
}: {
  address: string;
  asyncModel: string;
  message: Message;
  openConnections: { [key: string]: any };
}) => {
  let connection: any;
  if (!openConnections[address]) {
    let client = CreateClient({ address });
    connection = client.connect();
    openConnections[address] = connection;
  } else {
    connection = openConnections[address];
  }

  return new Observable((observer) => {
    try {
      connection.then((socket: any) => {
        const serializeData = JSON.stringify(message);
        const socketConnect = socket[asyncModel]({
          data: serializeData,
          metadata: '',
        });

        switch (asyncModel) {
          case ASYNC_MODEL_TYPES.REQUEST_RESPONSE:
            socketConnect.then((response: RsocketEventsPayload) => {
              const { data } = response && JSON.parse(response.data);
              observer.next(data);
            });
            break;

          case ASYNC_MODEL_TYPES.REQUEST_STREAM:
            socketConnect.subscribe((response: RsocketEventsPayload) => {
              const { data } = response && JSON.parse(response.data);
              observer.next(data);
            });
            break;

          default:
            observer.error(new Error('Unable to find asyncModel'));
        }

        socket.connectionStatus().subscribe(({ kind, error }: { kind: string; error?: Error }) => {
          if (kind.toUpperCase() === RSocketConnectionStatus.ERROR) {
            openConnections[address] = null;
            observer.error(error);
          }

          if (kind.toUpperCase() === RSocketConnectionStatus.CLOSED) {
            openConnections[address] = null;
          }
        });
      });
    } catch (error) {
      openConnections[address] = null;
      observer.error(error);
    }
  });
};

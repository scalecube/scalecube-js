import { Observable } from 'rxjs';
import { RemoteCallOptions, RsocketEventsPayload } from '../helpers/types';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { Endpoint, Message } from '../api';
import { getNotFoundByRouterError, ASYNC_MODEL_TYPES, RSocketConnectionStatus } from '../helpers/constants';
import { createClient } from '../TransportProviders/MicroserviceClient';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';

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
  return new Observable((observer) => {
    let connection: any;
    if (!openConnections[address]) {
      const client = createClient({ address });
      connection = new Promise((resolve, reject) => {
        client.connect().then(resolve, reject);
      });
      openConnections[address] = connection;
    } else {
      connection = openConnections[address];
    }

    connection.then((socket: any) => {
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
      const flowableError = (err: Error) => observer.error(err);

      switch (asyncModel) {
        case ASYNC_MODEL_TYPES.REQUEST_RESPONSE:
          socketConnect.then(flowableNext, flowableError); // Single type
          break;

        case ASYNC_MODEL_TYPES.REQUEST_STREAM:
          socketConnect.subscribe(flowableNext, flowableError, () => observer.complete()); // Flowable type
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
  });
};

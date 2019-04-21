import { Observable } from 'rxjs';
import { RemoteCallOptions, RsocketEventsPayload } from '../helpers/types';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { Endpoint } from '../api';
import { getNotFoundByRouterError, ASYNC_MODEL_TYPES } from '../helpers/constants';

// @ts-ignore
import RSocketEventsClient from 'rsocket-events-client';
// @ts-ignore
import { RSocketClient } from 'rsocket-core';

export const remoteCall = ({
  router,
  microserviceContext,
  message,
  asyncModel,
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

  const client = createClient({ address: endPoint.address });

  return new Observable((observer) => {
    client.connect().then((socket: any) => {
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
          observer.next(new Error('Unable to find asyncModel'));
      }
    });
  });
};

const createClient = (clientOptions: { address: string }) =>
  new RSocketClient({
    setup: {
      dataMimeType: 'text/plain',
      keepAlive: 1000000,
      lifetime: 100000,
      metadataMimeType: 'text/plain',
    },
    transport: new RSocketEventsClient(clientOptions),
  });

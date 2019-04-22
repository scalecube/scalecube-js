import { Observable, of } from 'rxjs';
import { RemoteCallOptions, RsocketEventsPayload } from '../helpers/types';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { Endpoint, Message } from '../api';
import { getNotFoundByRouterError, ASYNC_MODEL_TYPES } from '../helpers/constants';
import { CreateClient } from '../TransportProviders/MicroserviceClient';

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

  return remoteResponse({ address: endPoint.address, asyncModel, message });
};

const remoteResponse = ({
  address,
  asyncModel,
  message,
}: {
  address: string;
  asyncModel: string;
  message: Message;
}) => {
  const client = CreateClient({ address });

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

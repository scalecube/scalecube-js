// @ts-ignore
import RSocketEventsServer from 'rsocket-events-server';
// @ts-ignore
import { MAX_STREAM_ID, RSocketClient, RSocketServer } from 'rsocket-core';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { Observable } from 'rxjs';

import { MicroserviceContext, RsocketEventsPayload, ServiceCall } from '../helpers/types';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { defaultRouter } from '../Routers/default';
import { ASYNC_MODEL_TYPES } from '..';

export const createServer = ({
  address,
  microserviceContext,
}: {
  address: string;
  microserviceContext: MicroserviceContext;
}) => {
  const serviceCall = getServiceCall({ router: defaultRouter, microserviceContext });
  return new RSocketServer({
    getRequestHandler: (socket: any) => {
      return {
        requestResponse: (payload: RsocketEventsPayload) => requestResponse({ ...payload, serviceCall }),
        requestStream: (payload: RsocketEventsPayload) => requestStream({ ...payload, serviceCall }),
      };
    },
    transport: new RSocketEventsServer({ address }),
  });
};

const requestResponse = ({
  data,
  metadata,
  serviceCall,
}: {
  data: string;
  metadata: string;
  serviceCall: ServiceCall;
}) => {
  return new Single((subscriber: any) => {
    subscriber.onSubscribe();
    const message = JSON.parse(data);
    (serviceCall({
      message,
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      includeMessage: true,
    }) as Promise<any>)
      .then((response: any) => {
        subscriber.onComplete({ data: JSON.stringify(response), metadata: '' });
      })
      .catch(subscriber.onError);
  });
};

const requestStream = ({
  data,
  metadata,
  serviceCall,
}: {
  data: string;
  metadata: string;
  serviceCall: ServiceCall;
}) => {
  return new Flowable((subscriber: any) => {
    subscriber.onSubscribe();
    const message = JSON.parse(data);
    (serviceCall({
      message,
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      includeMessage: true,
    }) as Observable<any>).subscribe(
      (response: any) => {
        subscriber.onNext({ data: JSON.stringify(response), metadata: '' });
      },
      (error) => subscriber.onError(error),
      () => subscriber.onComplete()
    );
  });
};

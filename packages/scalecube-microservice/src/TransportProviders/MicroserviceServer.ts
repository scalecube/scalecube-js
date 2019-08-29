import { TransportApi, Address } from '@scalecube/api';
// @ts-ignore
import { RSocketServer } from 'rsocket-core';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { Observable } from 'rxjs';

import { RsocketEventsPayload, ServiceCall } from '../helpers/types';
import { ASYNC_MODEL_TYPES } from '..';

export const startServer = ({
  address,
  serviceCall,
  transportServerProvider,
}: {
  address: Address;
  serviceCall: ServiceCall;
  transportServerProvider: TransportApi.Provider;
}) => {
  const { factoryOptions, providerFactory, serializers } = transportServerProvider;
  const server = new RSocketServer({
    getRequestHandler: (socket: any) => {
      return {
        requestResponse: (payload: RsocketEventsPayload) => requestResponse({ ...payload, serviceCall }),
        requestStream: (payload: RsocketEventsPayload) => requestStream({ ...payload, serviceCall }),
      };
    },
    serializers,
    transport: providerFactory({ address, factoryOptions }),
  });

  server.start();

  return () => {
    try {
      server.stop.bind(server);
    } catch (e) {
      console.error('RSocket unable to close connection ' + e);
    }
  };
};

const requestResponse = ({
  data,
  metadata,
  serviceCall,
}: {
  data: any;
  metadata: string;
  serviceCall: ServiceCall;
}) => {
  return new Single((subscriber: any) => {
    subscriber.onSubscribe();
    (serviceCall({
      message: data,
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      messageFormat: true,
    }) as Promise<any>)
      .then((response: any) => {
        subscriber.onComplete({ data: response, metadata: { status: true } });
      })
      .catch((error: Error) => {
        subscriber.onComplete({ data: { data: error }, metadata: { status: false } });
      });
  });
};

const requestStream = ({ data, metadata, serviceCall }: { data: any; metadata: string; serviceCall: ServiceCall }) => {
  return new Flowable((subscriber: any) => {
    subscriber.onSubscribe();
    (serviceCall({
      message: data,
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      messageFormat: true,
    }) as Observable<any>).subscribe(
      (response: any) => {
        subscriber.onNext({ data: response, metadata: { status: true } });
      },
      (error) => {
        subscriber.onNext({ data: { data: error }, metadata: { status: false } });
        subscriber.onComplete();
      },
      () => subscriber.onComplete()
    );
  });
};

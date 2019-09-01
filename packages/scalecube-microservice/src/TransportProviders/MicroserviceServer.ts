import { TransportApi, Address } from '@scalecube/api';
// @ts-ignore
import { RSocketServer } from 'rsocket-core';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { Observable } from 'rxjs';

import { RsocketEventsPayload, ServiceCall } from '../helpers/types';
import { ASYNC_MODEL_TYPES } from '..';
import { saveToLogs } from '@scalecube/utils';

export const startServer = ({
  address,
  serviceCall,
  transportServerProvider,
  debug = false,
  whoAmI,
}: {
  address: Address;
  serviceCall: ServiceCall;
  transportServerProvider: TransportApi.Provider;
  debug: boolean;
  whoAmI: string;
}) => {
  const { factoryOptions, providerFactory, serializers } = transportServerProvider;
  const server = new RSocketServer({
    getRequestHandler: (socket: any) => {
      return {
        requestResponse: (payload: RsocketEventsPayload) => requestResponse({ ...payload, serviceCall, debug, whoAmI }),
        requestStream: (payload: RsocketEventsPayload) => requestStream({ ...payload, serviceCall, debug, whoAmI }),
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
  debug,
  whoAmI,
}: {
  data: any;
  metadata: string;
  serviceCall: ServiceCall;
  debug: boolean;
  whoAmI: string;
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
        saveToLogs(whoAmI, error.message, error, debug, 'warn');
        subscriber.onComplete({
          data: { data: { message: error.message, ...data } },
          metadata: { status: false },
        });
      });
  });
};

const requestStream = ({
  data,
  metadata,
  serviceCall,
  debug,
  whoAmI,
}: {
  data: any;
  metadata: string;
  serviceCall: ServiceCall;
  debug: boolean;
  whoAmI: string;
}) => {
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
        saveToLogs(whoAmI, error.message, error, debug, 'warn');
        subscriber.onNext({
          data: { data: { message: error.message, ...data } },
          metadata: { status: false },
        });
        subscriber.onComplete();
      },
      () => subscriber.onComplete()
    );
  });
};

// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { TransportApi } from '@scalecube/api';
import { createServer } from './createServer';
import { validateServerProvider } from '../helpers/validation';
import { SERVER_NOT_IMPL } from '../helpers/constants';

export const setupServer = (configuration: any): TransportApi.ServerTransport => {
  const serverProvider = {
    factoryOptions: null,
    providerFactory: () => {
      throw new Error(SERVER_NOT_IMPL);
    },
    ...configuration,
  };
  validateServerProvider(serverProvider.providerFactory);

  return (options: TransportApi.ServerTransportOptions): TransportApi.ServerStop => {
    const { localAddress, logger, serviceCall } = options;

    const requestResponse = (message: any) => {
      return new Single((subscriber: any) => {
        subscriber.onSubscribe();
        serviceCall
          .requestResponse(message)
          .then((response: any) => {
            subscriber.onComplete({ data: response, metadata: null });
          })
          .catch((error: Error) => {
            logger(error.message, 'warn');
            subscriber.onError({
              message: error,
            });
          });
      });
    };

    const requestStream = (message: any) => {
      return new Flowable((subscriber: any) => {
        subscriber.onSubscribe();
        serviceCall.requestStream(message).subscribe(
          (response: any) => {
            subscriber.onNext({ data: response, metadata: null });
          },
          (error: Error) => {
            logger(error.message, 'warn');
            subscriber.onError({
              message: error,
            });
          },
          () => subscriber.onComplete()
        );
      });
    };

    const stopServer = createServer({
      address: localAddress,
      serverProvider,
      serviceCall: { requestResponse, requestStream },
    });

    return stopServer;
  };
};

import uuidv4 from 'uuid/v4';
import createDiscovery from '@scalecube/scalecube-discovery';
import { defaultRouter } from '../Routers/default';
import { getProxy } from '../Proxy/Proxy';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { createServiceRegistry } from '../Registry/ServiceRegistry';
import { createMethodRegistry } from '../Registry/MethodRegistry';
import { MicroserviceContext, RsocketEventsPayload, ServiceCall } from '../helpers/types';
import { Endpoint, Message, Microservice, MicroserviceOptions, Microservices as MicroservicesInterface } from '../api';
import { ASYNC_MODEL_TYPES, MICROSERVICE_NOT_EXISTS } from '../helpers/constants';

// @ts-ignore
import RSocketEventsServer from 'rsocket-events-server';
// @ts-ignore
import { MAX_STREAM_ID, RSocketClient, RSocketServer } from 'rsocket-core';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { Observable } from 'rxjs';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: ({ services, seedAddress = 'defaultSeedAddress' }: MicroserviceOptions): Microservice => {
    const address = uuidv4();

    let microserviceContext: MicroserviceContext | null = createMicroserviceContext();
    const { methodRegistry, serviceRegistry } = microserviceContext;
    services && Array.isArray(services) && methodRegistry.add({ services, address });

    const endPointsToPublishInCluster =
      services && Array.isArray(services)
        ? serviceRegistry.createEndPoints({
            services,
            address,
          })
        : [];

    const discovery = createDiscovery({
      address,
      itemsToPublish: endPointsToPublishInCluster,
      seedAddress,
    });

    const server = createServer({ address, microserviceContext });
    server.start();

    discovery
      .discoveredItems$()
      .subscribe((discoveryEndpoints) => serviceRegistry.add({ endpoints: discoveryEndpoints as Endpoint[] }));

    return Object.freeze({
      createProxy({ router = defaultRouter, serviceDefinition }) {
        if (!microserviceContext) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        return getProxy({
          serviceCall: getServiceCall({ router, microserviceContext }),
          serviceDefinition,
        });
      },
      createServiceCall({ router = defaultRouter }) {
        if (!microserviceContext) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        const serviceCall = getServiceCall({ router, microserviceContext });
        return Object.freeze({
          requestStream: (message: Message) =>
            serviceCall({
              message,
              asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
              includeMessage: true,
            }),
          requestResponse: (message: Message) =>
            serviceCall({
              message,
              asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
              includeMessage: true,
            }),
        });
      },
      destroy(): null {
        if (!microserviceContext) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        discovery && discovery.destroy();

        Object.values(microserviceContext).forEach(
          (contextEntity) => typeof contextEntity.destroy === 'function' && contextEntity.destroy()
        );
        microserviceContext = null;

        return microserviceContext;
      },
    } as Microservice);
  },
});

export const createMicroserviceContext = () => {
  const serviceRegistry = createServiceRegistry();
  const methodRegistry = createMethodRegistry();
  return {
    serviceRegistry,
    methodRegistry,
  };
};

const createServer = ({
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

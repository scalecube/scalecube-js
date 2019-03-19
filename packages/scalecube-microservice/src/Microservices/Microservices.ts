import { getProxy } from '../Proxy/Proxy';
import { defaultRouter } from '../Routers/default';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { Message, Microservice, MicroserviceOptions, Microservices as MicroservicesInterface } from '../api/public';
import { ASYNC_MODEL_TYPES } from '..';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { createServiceRegistry } from '../Registry/ServiceRegistry';
import { createMethodRegistry } from '../Registry/MethodRegistry';
import { MicroserviceContext } from '../api/private/types';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: ({ services }: MicroserviceOptions): Microservice => {
    let microserviceContext: MicroserviceContext | null = createMicroserviceContext();
    const { methodRegistry } = microserviceContext;
    services && Array.isArray(services) && methodRegistry.add({ services });

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

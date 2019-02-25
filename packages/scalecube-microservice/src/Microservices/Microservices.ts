import { getProxy } from '../Proxy/Proxy';
import { defaultRouter } from '../Routers/default';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import {
  Message,
  Microservice,
  MicroserviceOptions,
  Microservices as MicroservicesInterface,
  Registry,
} from '../api/public';
import { createRegistry } from './Registry';

import { asyncModelTypes } from '../helpers/utils';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: ({ services }: MicroserviceOptions): Microservice => {
    let registry: Registry | null = createRegistry();
    services && Array.isArray(services) && registry.addToMethodRegistry({ services });

    return Object.freeze({
      createProxy({ router = defaultRouter, serviceDefinition }) {
        if (!registry) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        return getProxy({
          serviceCall: getServiceCall({ router, registry }),
          serviceDefinition,
        });
      },
      createServiceCall({ router = defaultRouter }) {
        if (!registry) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        const serviceCall = getServiceCall({ router, registry });
        return Object.freeze({
          requestStream: (message: Message) =>
            serviceCall({
              message,
              asyncModel: asyncModelTypes.observable,
              includeMessage: true,
            }),
          requestResponse: (message: Message) =>
            serviceCall({
              message,
              asyncModel: asyncModelTypes.promise,
              includeMessage: true,
            }),
        });
      },
      destroy(): null {
        if (!registry) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        registry = registry.destroy();

        return registry;
      },
    } as Microservice);
  },
});

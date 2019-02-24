import { Observable } from 'rxjs6';
import { getProxy } from '../Proxy/Proxy';
import { defaultRouter } from '../Routers/default';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import {
  ServiceCall,
  CreateServiceCallOptions,
  Message,
  Microservice,
  MicroserviceOptions,
  Microservices as MicroservicesInterface,
  ProxyOptions,
  Registry,
} from '../api/public';
import { createRegistry } from './Registry';

import { asyncModelTypes } from '../helpers/utils';
import { ServiceCallOptions } from '../api/private/types';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: ({ services }: MicroserviceOptions): Microservice => {
    let registry: Registry | null = createRegistry();
    services && Array.isArray(services) && registry.AddToMethodRegistry({ services });

    return Object.freeze({
      createProxy({ router = defaultRouter, serviceDefinition }: ProxyOptions) {
        if (!registry) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        return getProxy({
          serviceCall: getServiceCall({ router, registry }),
          serviceDefinition,
        });
      },
      createServiceCall({ router = defaultRouter }: CreateServiceCallOptions): ServiceCall {
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
            } as ServiceCallOptions) as Observable<Message>,
          requestResponse: (message: Message) =>
            serviceCall({
              message,
              asyncModel: asyncModelTypes.promise,
              includeMessage: true,
            } as ServiceCallOptions) as Promise<Message>,
        });
      },
      destroy(): null {
        if (!registry) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        registry = registry.destroy();

        return registry;
      },
    });
  },
});

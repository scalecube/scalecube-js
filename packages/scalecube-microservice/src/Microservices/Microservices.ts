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
} from '../api/public';
import { createRegistry } from './Registry';

import { asyncModelTypes } from '../helpers/utils';
import { ServiceCallOptions } from '../api/private/types';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: ({ services }: MicroserviceOptions): Microservice => {
    const registry = createRegistry();
    services && Array.isArray(services) && registry.AddToMethodRegistry({ services });

    return Object.freeze({
      createProxy({ router = defaultRouter, serviceDefinition }: ProxyOptions) {
        return getProxy({
          serviceCall: getServiceCall({ router, registry }),
          serviceDefinition,
        });
      },
      createServiceCall({ router = defaultRouter }: CreateServiceCallOptions): ServiceCall {
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
    });
  },
});

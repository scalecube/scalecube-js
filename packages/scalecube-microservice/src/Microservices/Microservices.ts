import { Observable } from 'rxjs6';
import { getProxy } from '../Proxy/Proxy';
import { defaultRouter } from '../Routers/default';
import { createServiceCall } from '../ServiceCall/ServiceCall';
import {
  DispatcherOptions,
  ProxyOptions,
  Dispatcher,
  Message,
  Microservice,
  MicroserviceOptions,
  Microservices as MicroservicesInterface,
} from '../api/public';
import { addServicesToRegistry } from './ServiceRegistry';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: ({ services }: MicroserviceOptions): Microservice => {
    const serviceRegistry =
      services && Array.isArray(services) ? addServicesToRegistry({ services, serviceRegistry: {} }) : {};

    return Object.freeze({
      createProxy({ router = defaultRouter, serviceDefinition }: ProxyOptions) {
        return getProxy({
          serviceCall: createServiceCall({ router, serviceRegistry }),
          serviceDefinition,
        });
      },
      createDispatcher({ router = defaultRouter }: DispatcherOptions): Dispatcher {
        const serviceCall = createServiceCall({ router, serviceRegistry });
        return Object.freeze({
          requestStream: (message: Message) =>
            serviceCall({ message, asyncModel: 'Observable', includeMessage: true }) as Observable<Message>,
          requestResponse: (message: Message) =>
            serviceCall({ message, asyncModel: 'Promise', includeMessage: true }) as Promise<Message>,
        });
      },
    });
  },
});

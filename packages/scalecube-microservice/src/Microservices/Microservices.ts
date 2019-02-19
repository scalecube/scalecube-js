import { addServices, addServicesLazy } from './MicroServiceBuilder';
import { getProxy } from '../Proxy';
import { defaultRouter } from '../Routers/default';
import { createServiceCall } from '../ServiceCall';
import {
  AddServiceToRegistryRequest,
  CreateDispatcherRequest,
  ProxyOptions,
  Dispatcher,
  Message,
  Microservice,
  MicroserviceOptions,
  MicroserviceProxy,
  Microservices as MicroservicesInterface,
  ServiceCall,
} from '../api2';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: ({ services, preRequest, postResponse }: MicroserviceOptions): Microservice => {
    let serviceRegistry = {};
    serviceRegistry = addServiceToRegistry({ services, serviceRegistry, action: addServices });

    const microservice: Microservice = Object.freeze({
      createProxy({ router = defaultRouter, serviceDefinition }: ProxyOptions): MicroserviceProxy<T> {
        const serviceCall = createServiceCall({ router, serviceRegistry, preRequest, postResponse });
        return getProxy({ serviceCall, serviceDefinition, microservice });
      },
      createDispatcher({ router = defaultRouter }: CreateDispatcherRequest): Dispatcher {
        const serviceCall = createServiceCall({ router, serviceRegistry, preRequest, postResponse });
        return Object.freeze({
          listen: (message: Message) => serviceCall({ message, type: 'Observable' }),
          invoke: (message: Message) => serviceCall({ message, type: 'Promise' }),
        });
      },
    });

    return microservice;
  },
});

const addServiceToRegistry = ({ services, serviceRegistry, action }: AddServiceToRegistryRequest) =>
  services && Array.isArray(services) ? action({ services, serviceRegistry }) : serviceRegistry;

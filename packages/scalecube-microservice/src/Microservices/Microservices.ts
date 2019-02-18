import { addServices, addServicesLazy } from './MicroServiceBuilder';
import { createProxy } from '../Proxy';
import { defaultRouter } from '../Routers/default';
import { createServiceCall } from '../ServiceCall';
import {
  AddServiceToRegistryRequest,
  CreateDispatcherRequest,
  CreateProxyRequest,
  Dispatcher,
  Message,
  Microservice,
  MicroserviceConfig,
  MicroserviceProxy,
  Microservices as MicroservicesInterface,
  ServiceCall,
} from '../api2';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: ({ services, lazyServices, preRequest, postResponse }: MicroserviceConfig): Microservice => {
    let serviceRegistry = {};
    serviceRegistry = addServiceToRegistry({ services, serviceRegistry, action: addServices });
    serviceRegistry = addServiceToRegistry({ services: lazyServices, serviceRegistry, action: addServicesLazy });

    const microservice: Microservice = Object.freeze({
      createProxy({ router = defaultRouter, serviceDefinition }: CreateProxyRequest): MicroserviceProxy<ServiceCall> {
        const serviceCall = createServiceCall({ router, serviceRegistry, preRequest, postResponse });
        return createProxy({ serviceCall, serviceDefinition, microservice: this });
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

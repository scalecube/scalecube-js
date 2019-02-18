import { addServices, addServicesLazy } from './MicroServiceBuilder';
import { createProxy } from '../Proxy';
import { defaultRouter } from '../Routers/default';
import { createServiceCall } from '../ServiceCall';
import Microservices from '../api2/Microservices';
import Message from '../api2/Message';
import MicroserviceConfig from '../api2/MicroserviceConfig';
import Microservice from '../api2/Microservice';

export const Microservices: Microservices = Object.freeze({
  create: ({ services, lazyServices, preRequest, postResponse }: MicroserviceConfig): Microservice => {
    let serviceRegistry = {};
    serviceRegistry = addServiceToRegistry({ arr: services, serviceRegistry, action: addServices });
    serviceRegistry = addServiceToRegistry({ arr: lazyServices, serviceRegistry, action: addServicesLazy });

    const microservice: Microservice = Object.freeze({
      createProxy({ router = defaultRouter, serviceDefinition }) {
        const serviceCall = createServiceCall({ router, serviceRegistry, preRequest, postResponse });
        return createProxy({ serviceCall, serviceDefinition, microservice: this });
      },
      createDispatcher({ router = defaultRouter }) {
        // Is dispatcher an object with listen and invoke or is it a function, that returns method call result?
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

const addServiceToRegistry = ({ arr, serviceRegistry, action }) =>
  arr && Array.isArray(arr) ? action({ services: arr, serviceRegistry }) : serviceRegistry;

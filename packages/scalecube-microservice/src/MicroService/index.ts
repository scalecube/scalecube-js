import { addServices, addServicesLazy } from './MicroServiceBuilder';
import { createProxy } from '../Proxy';
import { defaultRouter } from '../Routers/default';
import { createDispatcher } from '../Dispatcher';
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
        const dispatcher = createDispatcher({ router, serviceRegistry, preRequest, postResponse });
        return createProxy({ dispatcher, serviceDefinition, microservice: this });
      },
      createDispatcher({ router = defaultRouter }) {
        const dispatcher = createDispatcher({ router, serviceRegistry, preRequest, postResponse });
        return Object.freeze({
          listen: (message: Message) => dispatcher({ message, type: 'Observable' }),
          invoke: (message: Message) => dispatcher({ message, type: 'Promise' }),
        });
      },
    });

    return microservice;
  },
});

const addServiceToRegistry = ({ arr, serviceRegistry, action }) =>
  arr && Array.isArray(arr) ? action({ services: arr, serviceRegistry }) : serviceRegistry;

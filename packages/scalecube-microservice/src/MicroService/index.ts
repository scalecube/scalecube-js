import { MicroServiceConfig, MicroServiceResponse } from '../api/Service';
import { addServices, addServicesLazy } from './MicroServiceBuilder';
import { createProxy, proxyDispatcher } from '../Proxy';
import { defaultRouter } from '../Routers/default';
import { createDispatcher } from '../Dispatcher';
import { Message } from '../api/Message';

export const MicroService = Object.freeze({
  create: ({ services, lazyServices, getPreRequest$, postResponse$ }: MicroServiceConfig): MicroServiceResponse => {
    let serviceRegistry = {};
    serviceRegistry = addServiceToRegistry({ arr: services, serviceRegistry, action: addServices });
    serviceRegistry = addServiceToRegistry({ arr: lazyServices, serviceRegistry, action: addServicesLazy });

    const microServiceResponse = Object.freeze({
      asProxy({ router = defaultRouter, serviceContract }) {
        const dispatcher = proxyDispatcher({ router, serviceRegistry, getPreRequest$, postResponse$ });
        return createProxy({ dispatcher, serviceContract, proxy: this.asProxy.bind(microServiceResponse) });
      },
      asDispatcher({ router = defaultRouter }) {
        const dispatcher = createDispatcher({ router, serviceRegistry, getPreRequest$, postResponse$ });
        return Object.freeze({
          listen: (message: Message) => dispatcher({ message, type: 'Observable' }),
          invoke: (message: Message) => dispatcher({ message, type: 'Promise' }),
        });
      },
    });

    return microServiceResponse;
  },
});

const addServiceToRegistry = ({ arr, serviceRegistry, action }) =>
  arr && Array.isArray(arr) ? action({ services: arr, serviceRegistry }) : serviceRegistry;

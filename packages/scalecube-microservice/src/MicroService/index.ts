import { MicroServiceConfig, MicroServiceResponse } from '../api/Service';
import { addServices, addServicesLazy } from './MicroServiceBuilder';
import { createProxy, proxyDispatcher } from '../Proxy';
import { defaultRouter } from '../Routers/default';

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
      asDispatcher({ router }) {
        // TODO need to implement
        // TODO need to check data type (array)
      },
    });

    return microServiceResponse;
  },
});

const addServiceToRegistry = ({ arr, serviceRegistry, action }) => {
  return arr && Array.isArray(arr) ? action({ services: arr, serviceRegistry }) : serviceRegistry;
};

// MicroService.create({}).asProxy()

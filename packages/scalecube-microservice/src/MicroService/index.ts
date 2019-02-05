import { MicroServiceConfig, MicroServiceResponse } from '../api/Service';
import { addServices, addServicesAsync } from './MicroServiceBuilder';
import { createProxy } from '../Proxy';

const MicroService = Object.freeze({
  create: ({ services, loadServicesAsync, preRequest$, postResponse$ }: MicroServiceConfig): MicroServiceResponse => {
    let serviceRegistry = {};

    serviceRegistry = addServiceToRegistry({ arr: services, serviceRegistry, action: addServices });

    serviceRegistry = addServiceToRegistry({ arr: loadServicesAsync, serviceRegistry, action: addServicesAsync });

    return Object.freeze({
      asProxy({ serviceContract, router }) {
        return createProxy({ serviceRegistry, preRequest$, postResponse$, serviceContract, router });
      },
      asDispatcher({ router }) {
        // TODO need to implement
      },
    });
  },
});

const addServiceToRegistry = ({ arr, serviceRegistry, action }) => {
  return arr && Array.isArray(arr) ? action({ services: arr, serviceRegistry }) : serviceRegistry;
};

export default {
  MicroService,
};

// MicroService.create({}).asProxy()

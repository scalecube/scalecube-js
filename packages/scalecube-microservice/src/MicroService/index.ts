import { MicroServiceConfig, MicroServiceResponse } from '../api/Service';
import { addServices, addServicesAsync } from './MicroServiceBuilder';

const MicroService = Object.freeze({
  create: ({ services, loadServicesAsync, preRequest$, postResponse$ }: MicroServiceConfig): MicroServiceResponse => {
    let serviceRegistry = {};

    serviceRegistry =
      services && Array.isArray(services)
        ? addServices({
            services,
            serviceRegistry,
          })
        : serviceRegistry;

    serviceRegistry =
      loadServicesAsync && Array.isArray(loadServicesAsync)
        ? addServicesAsync({
            loadServicesAsync,
            serviceRegistry,
          })
        : serviceRegistry;

    return Object.freeze({
      asProxy({ serviceContract }) {
        //return new ProxyContext({serviceRegistry, preRequest, postResponse, serviceContract});
      },
      asDispatcher() {
        //TODO need to implement
      },
    });
  },
});

export default {
  MicroService,
};

// MicroService.create({}).asProxy()

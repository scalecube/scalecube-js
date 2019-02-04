import MicroServiceBuilder from './MicroServiceBuilder';
import { MicroServiceConfig } from '../api/Service';

const MicroService = Object.freeze({
  create: ({ services, loadServicesAsync, preRequest$, postResponse$ }: MicroServiceConfig) => {
    const microServiceBuilder = new MicroServiceBuilder();

    services && Array.isArray(services) && microServiceBuilder.services(services);

    loadServicesAsync && Array.isArray(loadServicesAsync) && microServiceBuilder.loadServiceAsync(loadServicesAsync);

    preRequest$ && microServiceBuilder.preRequest$(preRequest$);

    postResponse$ && microServiceBuilder.postResponse$(postResponse$);

    return microServiceNextStep;
  },
});

const microServiceNextStep = Object.freeze({
  asProxy({ serviceContract }) {
    //return new ProxyContext({serviceRegistry, preRequest, postResponse, serviceContract});
  },
  asDispatcher() {
    //TODO need to implement
  },
});

export default {
  MicroService,
};

// MicroService.create({}).asProxy()

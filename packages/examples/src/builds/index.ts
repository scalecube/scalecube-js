import { createMicroservice } from '@scalecube/scalecube-microservice';
import { MicroserviceApi } from '@scalecube/api';

import GreetingService, { greetingServiceDefinition } from './service/GreetingService';

const reference: MicroserviceApi.ServiceReference = new GreetingService();

const greetingService: MicroserviceApi.Service = {
  definition: greetingServiceDefinition,
  reference,
};

const ms = createMicroservice({ address: 'localMS', seedAddress: 'seed', debug: true });

const { greetProxy } = ms.createProxies({
  proxies: [
    {
      serviceDefinition: greetingServiceDefinition,
      proxyName: 'greetProxy',
    },
  ],
  isAsync: true,
});

greetProxy.then(({ proxy }: { proxy: any }) => {
  proxy.hello('User').then((result: string) => {
    console.info('result from greeting service - hello', result);
  });

  proxy.greet$(['User1', 'User2', 'User3']).subscribe((result: string) => {
    console.info('result from greeting service - greet$', result);
  });
});

createMicroservice({ services: [greetingService], address: 'seed', debug: true });

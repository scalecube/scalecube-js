import { createMicroservice } from '@scalecube/browser';
import { MicroserviceApi } from '@scalecube/api';
import GreetingService, { greetingServiceDefinition } from './service/GreetingService';

const reference: MicroserviceApi.ServiceReference = new GreetingService();

const greetingService: MicroserviceApi.Service = {
  definition: greetingServiceDefinition,
  reference,
};

const ms = createMicroservice({ address: 'localMS', seedAddress: 'seed', debug: true });

const proxy = ms.createProxy({
  serviceDefinition: greetingServiceDefinition,
});

const resultEl = document.getElementById('result');

proxy.hello('User').then((result: string) => {
  const div = document.createElement('div');
  div.innerHTML = result;
  // @ts-ignore
  resultEl.appendChild(div);
  console.info('result from greeting service - hello', result);
});

proxy.greet$(['User1', 'User2', 'User3']).subscribe((result: string) => {
  const div = document.createElement('div');
  div.innerHTML = result;
  // @ts-ignore
  resultEl.appendChild(div);
  console.info('result from greeting service - greet$', result);
});

createMicroservice({ services: [greetingService], address: 'seed', debug: true });

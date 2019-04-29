import { Service } from '../../src/api';
import { greetingServiceDefinition } from '../mocks/GreetingService';
import GreetingService from '../mocks/GreetingService';
import Microservices from '../../src';

import { applyMessageChannelPolyfill } from '../mocks/utils/MessageChannelPolyfill';
import { applyPostMessagePolyfill } from '../mocks/utils/PostMessageWithTransferPolyfill';

describe(`RemoteCall testing`, () => {
  applyPostMessagePolyfill();
  applyMessageChannelPolyfill();

  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };

  test(`test`, (done) => {
    const ms = Microservices.create({ services: [] });
    Microservices.create({ services: [greetingService1] });
    const proxy = ms.createProxy({ serviceDefinition: greetingServiceDefinition });
    proxy
      .hello('testUser')
      .then((res: any) => {
        console.log('res', res);
        done();
      })
      .catch((err: any) => {
        console.log('err', err);
        done();
      });
  });
});

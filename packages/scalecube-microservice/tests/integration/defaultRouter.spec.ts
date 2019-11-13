import { greet$, greetingServiceDefinition, hello } from '../mocks/GreetingService';
import { getAddress, getFullAddress } from '@scalecube/utils';
import { createMS } from '../mocks/microserviceFactory';
import { getNotFoundByRouterError } from '../../src/helpers/constants';

describe(`
  Background:

    Given msB , msA
    And   msA have a open connection with msB
    And   msB have a open connection with msA
    
          | microservice | address | seedAddress | service |
          | msB          | B       |  A          | hello   |
          | msA          | A       |             |         |
          
    When msA try to do removeCall to the service hello('ME')
    Then it will resolve 'Hello ME'
    `, () => {
  test(`
  Scenario: destroy msB (registry doesn't have any 'hello' service)
    When    msB is destroyed.
    And     msA try to do removeCall to the service 'hello'
    Then    exception will occur: 'can't find services with the request: 'GreetingService/hello'`, (done) => {
    // @ts-ignore
    expect.assertions(2);

    const service = {
      definition: greetingServiceDefinition,
      reference: { greet$, hello },
    };

    const serviceDefinition = service.definition;
    const address = getAddress('A');
    const msB = createMS({
      services: [service],
      address: 'B',
      seedAddress: 'A',
    });

    const msA = createMS({
      address,
    });

    const proxy = msA.createProxy({ serviceDefinition });

    proxy.hello('ME').then((res: any) => {
      expect(res).toMatch('Hello ME');
      msB.destroy().then(() => {
        proxy.hello('ME').catch((e: Error) => {
          expect(e.message).toMatch(
            getNotFoundByRouterError(getFullAddress(address), `${serviceDefinition.serviceName}/hello`)
          );
          msA.destroy();
          done();
        });
      });
    });
  });
});

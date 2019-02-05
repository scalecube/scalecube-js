import { addServices, addServicesAsync } from './MicroServiceBuilder';
import { greetingServiceInstance, createHelloService } from '../../__mocks__/GreetingService';
import { getServiceNamespace } from '../helpers/utils';

describe('MicroServiceBuilder', () => {
  it('addServices - immutability', () => {
    const serviceRegistry = {};
    const newServiceRegistry = addServices({
      services: [greetingServiceInstance, greetingServiceInstance, greetingServiceInstance],
      serviceRegistry,
    });

    expect(Object.keys(serviceRegistry)).toHaveLength(0);
    expect(Object.keys(newServiceRegistry)).toHaveLength(2);
  });

  it('addServices - add services to serviceRegistry', () => {
    const serviceRegistry = addServices({
      services: [greetingServiceInstance, greetingServiceInstance, greetingServiceInstance],
      serviceRegistry: {},
    });
    const helloService = createHelloService();

    expect(Object.keys(serviceRegistry[getServiceNamespace(helloService)])).toHaveLength(3);
  });
});

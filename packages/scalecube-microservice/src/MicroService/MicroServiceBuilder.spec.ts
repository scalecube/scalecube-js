import { addServices, addServicesAsync } from './MicroServiceBuilder';
import { getGreetingServiceInstance, createHelloService } from '../../__mocks__/GreetingService';
import { getServiceNamespace } from '../helpers/serviceData';

describe('MicroServiceBuilder', () => {
  let services: any[];
  beforeAll(() => {
    services = [getGreetingServiceInstance('1'), getGreetingServiceInstance('2'), getGreetingServiceInstance('3')];
  });

  it('addServices - immutability', () => {
    const serviceRegistry = {};
    const newServiceRegistry = addServices({
      services,
      serviceRegistry,
    });

    expect(Object.keys(serviceRegistry)).toHaveLength(0);
    expect(Object.keys(newServiceRegistry)).toHaveLength(2);
  });

  it('addServices - add services to serviceRegistry', () => {
    const serviceRegistry = addServices({
      services,
      serviceRegistry: {},
    });
    const helloService = createHelloService();

    expect(Object.keys(serviceRegistry[getServiceNamespace(helloService)])).toHaveLength(3);
  });
});

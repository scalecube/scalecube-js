import { greetingServiceInstance, createHelloService } from '../../__mocks__/GreetingService';
import {
  servicesFromRawService,
  addServiceToRegistry,
  updateServiceRegistry,
  lookUp,
  serviceEndPoint,
} from './ServiceRegistry';
import { getMethodName, getServiceName, getServiceNamespace } from '../helpers/serviceData';

describe('ServiceRegistry', () => {
  it('check serviceRegistry immutability', () => {
    const serviceRegistry = {};
    const newServiceRegistry = updateServiceRegistry({ serviceRegistry, rawService: greetingServiceInstance });

    expect(Object.keys(serviceRegistry)).toHaveLength(0);
    expect(Object.keys(newServiceRegistry)).toHaveLength(2);
  });

  it('servicesFromRawService - split rawService to multiple services', () => {
    const services = servicesFromRawService({ rawService: greetingServiceInstance });

    expect(Array.isArray(services)).toBe(true);
    expect(services).toHaveLength(2);

    // tslint:disable-next-line
    const meta = services[0]['meta'];
    expect(meta.serviceName).toBeDefined();
    expect(meta.methodName).toBeDefined();
    expect(meta.asyncModel).toBeDefined();
  });

  it('addServiceToRegistry - add service to serviceRegistry', () => {
    const helloService = createHelloService();
    const helloService2 = createHelloService();
    const nameSpace = `${getServiceName(helloService)}/${getMethodName(helloService)}`;

    let serviceRegistry = addServiceToRegistry({ serviceRegistry: {}, service: helloService });
    expect(Object.keys(serviceRegistry)).toHaveLength(1);
    // tslint:disable-next-line
    expect(Object.keys(serviceRegistry[nameSpace])).toHaveLength(1);

    serviceRegistry = addServiceToRegistry({ serviceRegistry, service: helloService2 });
    expect(Object.keys(serviceRegistry)).toHaveLength(1);
    // tslint:disable-next-line
    expect(Object.keys(serviceRegistry[nameSpace])).toHaveLength(2);
  });

  it('updateServiceRegistry - add rawService to serviceRegistry', () => {
    const serviceRegistry = updateServiceRegistry({ serviceRegistry: {}, rawService: greetingServiceInstance });

    expect(Object.keys(serviceRegistry)).toHaveLength(2);
  });

  it('lookUp - extract service from serviceRegistry by namespace', () => {
    const serviceRegistry = updateServiceRegistry({ serviceRegistry: {}, rawService: greetingServiceInstance });
    const namespace = getServiceNamespace(createHelloService());
    const service = lookUp({ serviceRegistry, namespace });

    expect(service).toBeDefined();
  });

  it('serviceEndPoint', () => {
    const helloService = createHelloService();
    const endPoint = serviceEndPoint({ service: helloService });
    // tslint:disable-next-line
    expect(endPoint[helloService.identifier]).toBeDefined();
  });
});

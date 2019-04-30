// @ts-ignore
import uuidv4 from 'uuid/v4';
import { Endpoint, Service } from '../api';
import { GreetingService, greetingServiceDefinition } from '../../tests/mocks/GreetingService';
import { getQualifier } from '../helpers/serviceData';
import {
  createServiceRegistry,
  getEndpointsFromService,
  getEndpointsFromServices,
  getUpdatedServiceRegistry,
} from './ServiceRegistry';
import { ASYNC_MODEL_TYPES, getServiceIsNotValidError } from '../helpers/constants';

describe('ServiceRegistry Testing', () => {
  const address = uuidv4();
  const serviceName = 'serviceName';
  const methodName = 'methodName';
  const qualifier = getQualifier({ serviceName, methodName });
  const endpoint: Endpoint = {
    qualifier,
    serviceName,
    methodName,
    transport: 'transport',
    uri: 'uri',
    asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    address,
  };

  describe('Test ServiceRegistry factory', () => {
    let registry: any;

    beforeEach(() => {
      registry && registry.destroy();
      registry = createServiceRegistry();
    });

    it('Test after createServiceRegistry(): ServiceRegistry - all methods are define', () => {
      const NUMBER_OF_REGISTRY_PROPERTIES = 4;

      expect(registry.lookUp).toBeDefined();
      expect(registry.add).toBeDefined();
      expect(registry.destroy).toBeDefined();
      expect(registry.createEndPoints).toBeDefined();

      expect(Object.keys(registry)).toHaveLength(NUMBER_OF_REGISTRY_PROPERTIES);
    });

    it('Test add({ endpoints }): Endpoint[] - group all endPoints with the same qualifier', () => {
      const endpoint1 = { ...endpoint, qualifier: 'qualifier1' };
      const endpoint2 = { ...endpoint, qualifier: 'qualifier2' };

      const endpoints = [endpoint1, endpoint1, endpoint2];
      const serviceRegistry = registry.add({
        endpoints,
      });

      expect(Object.keys(serviceRegistry)).toHaveLength(2);
      // @ts-ignore-next-line
      const service1 = serviceRegistry.qualifier1;
      // @ts-ignore-next-line
      const service2 = serviceRegistry.qualifier2;

      expect(Object.keys(service1)).toHaveLength(2);
      expect(service1[0]).toMatchObject(endpoint1);
      expect(Object.keys(service2)).toHaveLength(1);
      expect(service2[0]).toMatchObject(endpoint2);
    });

    it('Test add({ endpoints }): Endpoint[] - without services', () => {
      const serviceRegistry = registry.add({});
      expect(serviceRegistry).toMatchObject({});
    });

    it('Test lookUp ({ qualifier }): Endpoint[] | [] - return [] if qualifier not found', () => {
      registry.add({
        endpoints: [endpoint],
      });

      const emptyResult = registry.lookUp({ qualifier: 'fakeQualifier' });
      expect(emptyResult).toMatchObject([]);
    });

    it('Test lookUp ({ qualifier }): Endpoint[] | [] - return endPoint[] if qualifier is found', () => {
      registry.add({
        endpoints: [endpoint],
      });
      const messageQualifier = getQualifier({ serviceName: endpoint.serviceName, methodName: endpoint.methodName });

      const result = registry.lookUp({ qualifier: messageQualifier });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          asyncModel: expect.any(String),
          methodName: expect.any(String),
          qualifier: expect.any(String),
          serviceName: expect.any(String),
          uri: expect.any(String),
          transport: expect.any(String),
        })
      );
    });
  });
  describe('Test destroy() : null', () => {
    const registry: any = createServiceRegistry();
    const registryAfterClean = registry.destroy();

    it('Test output of registry.destroy = null', () => {
      expect(registryAfterClean).toBe(null);
    });
    it('Test lookUp after use of destroy', () => {
      try {
        registry.lookUp({ qualifier });
      } catch (e) {
        expect(e.message).toMatch('microservice does not exists');
      }
    });

    it('Test add after use of destroy', () => {
      try {
        registry.add({ services: [] });
      } catch (e) {
        expect(e.message).toMatch('microservice does not exists');
      }
    });
  });
  describe('Test helpers', () => {
    console.error = jest.fn(); // disable validation logs while doing this test
    const service: Service = {
      definition: greetingServiceDefinition,
      reference: new GreetingService(),
    };

    it('Test getEndpointsFromServices({ services }) : Endpoint[]', () => {
      const NUMBER_OF_END_POINTS = 6;
      const endpoints: Endpoint[] = getEndpointsFromServices({
        services: [service, service, service],
        address,
      });

      expect(endpoints).toHaveLength(NUMBER_OF_END_POINTS);
    });

    it('Test getEndpointsFromServices({ services }) : Endpoint[] | [] -  without parameters', () => {
      const endpoints: Endpoint[] = getEndpointsFromServices({ address });

      expect(Array.isArray(endpoints)).toBeTruthy();
      expect(endpoints).toHaveLength(0);
    });

    it('Test getUpdatedServiceRegistry({ serviceRegistry, endpoints }) : ServiceRegistryMap', () => {
      const NUMBER_OF_END_POINTS = 5;
      const serviceRegistryMap = {
        [qualifier]: [endpoint, endpoint],
      };

      const immutableServiceRegistry = getUpdatedServiceRegistry({
        serviceRegistryMap,
        endpoints: [endpoint, endpoint, endpoint],
      });

      expect(immutableServiceRegistry === serviceRegistryMap).toBe(false);
      expect(immutableServiceRegistry[qualifier]).toHaveLength(NUMBER_OF_END_POINTS);
    });

    it('Test getEndpointsFromService({ service, type }) : Endpoint[]', () => {
      const NUMBER_OF_END_POINTS = 2;
      const NUMBER_OF_PROPERTY_END_POINT = 7;

      const endPoints = getEndpointsFromService({
        service,
        address,
      });
      expect(endPoints).toHaveLength(NUMBER_OF_END_POINTS);

      const endPoint: Endpoint = endPoints[0];
      expect(Object.keys(endPoint)).toHaveLength(NUMBER_OF_PROPERTY_END_POINT);
      expect(endPoint).toEqual(
        expect.objectContaining({
          asyncModel: expect.any(String),
          methodName: expect.any(String),
          qualifier: expect.any(String),
          serviceName: expect.any(String),
          uri: expect.any(String),
          transport: expect.any(String),
          address: expect.any(String),
        })
      );
    });

    it('Test getEndpointsFromService({ service }) : Endpoint[] - fail', () => {
      const fakeServiceName = 'fakeService';
      try {
        getEndpointsFromService({
          service: {
            // @ts-ignore
            definition: {
              serviceName: fakeServiceName,
            },
            reference: new GreetingService(),
          },
        });
      } catch (e) {
        expect(e.message).toMatch(getServiceIsNotValidError(fakeServiceName));
      }
    });
  });
});

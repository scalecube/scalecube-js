import { Endpoint, Service } from '../api/public';
import GreetingService, { greetingServiceDefinition } from '../../tests/mocks/GreetingService';
import { getQualifier } from '../helpers/serviceData';
import {
  createServiceRegistry,
  getEndpointsFromService,
  getEndpointsFromServices,
  getUpdatedServiceRegistry,
} from './ServiceRegistry';
import { ASYNC_MODEL_TYPES, getServiceIsNotValidError } from '../helpers/constants';

describe('ServiceRegistry Testing', () => {
  describe('Test ServiceRegistry factory', () => {
    let registry: any;

    beforeEach(() => {
      registry && registry.destroy();
      registry = createServiceRegistry();
    });

    const service: Service = {
      definition: greetingServiceDefinition,
      reference: new GreetingService(),
    };

    it('Test after createServiceRegistry(): ServiceRegistry - all methods are define', () => {
      const NUMBER_OF_REGISTRY_PROPERTIES = 3;

      expect(registry.lookUp).toBeDefined();
      expect(registry.add).toBeDefined();
      expect(registry.destroy).toBeDefined();

      expect(Object.keys(registry)).toHaveLength(NUMBER_OF_REGISTRY_PROPERTIES);
    });

    it('Test add({ services }): AvailableServices - add qualifier for each unique qualifier, push to the unique qualifier all endPoints with the same qualifier', () => {
      const services = [service, service, service, service];
      const NUMBER_OF_END_POINTS_IN_QUALIFIER = services.length;
      const NUMBER_OF_QUALIFIER = Object.keys(service).length;
      const serviceRegistry = registry.add({
        services,
      });

      const qualifiers = Object.keys(serviceRegistry);
      expect(qualifiers).toHaveLength(NUMBER_OF_QUALIFIER);

      const endpoints: Endpoint[] = serviceRegistry[qualifiers[0]];
      expect(endpoints).toHaveLength(NUMBER_OF_END_POINTS_IN_QUALIFIER);
    });

    it('Test add({ services }): AvailableServices - without services', () => {
      const serviceRegistry = registry.add({});
      expect(serviceRegistry).toMatchObject({});
    });

    it('Test lookUp ({ qualifier }): Endpoint[] | [] - return [] if qualifier not found', () => {
      registry.add({
        services: [service],
      });

      const emptyResult = registry.lookUp({ qualifier: 'fakeQualifier' });
      expect(emptyResult).toMatchObject([]);
    });

    it('Test lookUp ({ qualifier }): Endpoint[] | [] - return endPoint[] if qualifier is found', () => {
      registry.add({
        services: [service],
      });
      const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
      const result = registry.lookUp({ qualifier });
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
    const qualifier = 'faleQualifier';
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
      });

      expect(endpoints).toHaveLength(NUMBER_OF_END_POINTS);
    });

    it('Test getEndpointsFromServices({ services }) : Endpoint[] | [] -  without parameters', () => {
      const endpoints: Endpoint[] = getEndpointsFromServices({});

      expect(Array.isArray(endpoints)).toBeTruthy();
      expect(endpoints).toHaveLength(0);
    });

    it('Test getUpdatedServiceRegistry({ serviceRegistry, endpoints }) : ServiceRegistryMap', () => {
      const NUMBER_OF_END_POINTS = 5;

      const qualifier = 'qualifier';

      const endpoint: Endpoint = {
        qualifier,
        serviceName: 'serviceName',
        methodName: 'methodName',
        transport: 'transport',
        uri: 'uri',
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      };
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
      const NUMBER_OF_PROPERTY_END_POINT = 6;

      const endPoints = getEndpointsFromService({
        service,
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
        })
      );
    });

    it('Test getEndpointsFromService({ service }) : Endpoint[] - fail', () => {
      const serviceName = 'fakeService';
      try {
        const endpoints = getEndpointsFromService({
          service: {
            // @ts-ignore
            definition: {
              serviceName,
            },
            reference: new GreetingService(),
          },
        });
      } catch (e) {
        expect(e.message).toMatch(getServiceIsNotValidError(serviceName));
      }
    });
  });
});

import { Endpoint, Reference, Registry, Service } from '../api/public';
import { greetingServiceDefinition } from '../../__mocks__/GreetingService';
import GreetingService from '../../__mocks__/GreetingService';
import {
  createRegistry,
  getDataFromService,
  getEndpointsFromServices,
  getUpdatedMethodRegistry,
  getUpdatedServiceRegistry,
} from './Registry';
import { END_POINT, REFERENCE } from '../helpers/constants';

describe('Registry Testing', () => {
  describe('Test registry factory', () => {
    let registry: Registry;

    beforeEach(() => {
      registry && registry.destroy();
      registry = createRegistry();
    });

    const service: Service = {
      definition: greetingServiceDefinition,
      reference: new GreetingService(),
    };

    it('Test after createRegistry(): Registry - all methods are define', () => {
      const NUMBER_OF_REGISTRY_PROPERTIES = 5;

      expect(registry.lookUpRemote).toBeDefined();
      expect(registry.lookUpLocal).toBeDefined();
      expect(registry.AddToMethodRegistry).toBeDefined();
      expect(registry.AddToServiceRegistry).toBeDefined();
      expect(registry.destroy).toBeDefined();

      expect(Object.keys(registry)).toHaveLength(NUMBER_OF_REGISTRY_PROPERTIES);
    });

    it('Test AddToMethodRegistry({ services }): MethodRegistryDataStructure', () => {
      const NUMBER_OF_REFERENCES = 2;

      const methodRegistry = registry.AddToMethodRegistry({
        services: [service, service],
      });

      const qualifiers = Object.keys(methodRegistry);
      expect(qualifiers).toHaveLength(NUMBER_OF_REFERENCES);
    });

    it('Test AddToServiceRegistry({ services }): ServiceRegistryDataStructure', () => {
      const serviceRegistry = registry.AddToServiceRegistry({
        services: [service, service],
      });

      const qualifiers = Object.keys(serviceRegistry);
      expect(qualifiers).toHaveLength(2);

      const endpoints: Endpoint[] = serviceRegistry[qualifiers[0]];
      expect(endpoints).toHaveLength(2);
    });
  });
  describe('Test destroy() : null', () => {
    const registry = createRegistry();
    const qualifier = 'faleQualifier';
    const registryAfterClean = registry.destroy();

    it('Test output of registry.destroy = null', () => {
      expect(registryAfterClean).toBe(null);
    });
    it('Test lookUpLocal after use of destroy', () => {
      try {
        registry.lookUpLocal({ qualifier });
      } catch (e) {
        expect(e.message).toMatch('microservice does not exists');
      }
    });
    it('Test lookUpRemote after use of destroy', () => {
      try {
        registry.lookUpRemote({ qualifier });
      } catch (e) {
        expect(e.message).toMatch('microservice does not exists');
      }
    });
    it('Test AddToMethodRegistry after use of destroy', () => {
      try {
        registry.AddToMethodRegistry({ services: [] });
      } catch (e) {
        expect(e.message).toMatch('microservice does not exists');
      }
    });
    it('Test AddToServiceRegistry after use of destroy', () => {
      try {
        registry.AddToServiceRegistry({ services: [] });
      } catch (e) {
        expect(e.message).toMatch('microservice does not exists');
      }
    });
  });
  describe('Test helpers', () => {
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

    it('Test getReferenceFromServices({ services }) : Reference[]', () => {
      const NUMBER_OF_REFERENCES = 6;
      const references: Reference[] = getEndpointsFromServices({
        services: [service, service, service],
      });

      expect(references).toHaveLength(NUMBER_OF_REFERENCES);
    });

    it('Test getUpdatedServiceRegistry({ serviceRegistry, endpoints }) : ServiceRegistryDataStructure', () => {
      const NUMBER_OF_END_POINTS = 5;

      const qualifier = 'qualifier';

      const endpoint: Endpoint = {
        qualifier,
        serviceName: 'serviceName',
        methodName: 'methodName',
        transport: 'transport',
        uri: 'uri',
        asyncModel: 'Promise',
      };
      const serviceRegistry = {
        [qualifier]: [endpoint, endpoint],
      };

      const immutableServiceRegistry = getUpdatedServiceRegistry({
        serviceRegistry,
        endpoints: [endpoint, endpoint, endpoint],
      });

      expect(immutableServiceRegistry === serviceRegistry).toBe(false);
      expect(immutableServiceRegistry[qualifier]).toHaveLength(NUMBER_OF_END_POINTS);
    });

    it('Test getUpdatedMethodRegistry({ methodRegistry, references }) : ServiceRegistryDataStructure', () => {
      const NUMBER_OF_REFERENCES = 1;

      const qualifier = 'qualifier';

      const reference: Reference = {
        qualifier,
        serviceName: 'serviceName',
        methodName: 'methodName',
        asyncModel: 'Promise',
        reference: {
          fakeMethod: () => {},
        },
      };
      const methodRegistry = {
        [qualifier]: reference,
      };

      const immutableMethodRegistry = getUpdatedMethodRegistry({
        methodRegistry,
        references: [reference, reference, reference],
      });

      expect(immutableMethodRegistry === methodRegistry).toBe(false);
      expect(Object.keys(immutableMethodRegistry)).toHaveLength(NUMBER_OF_REFERENCES);
    });

    it('Test getDataFromService({ service, type }) : Reference[]', () => {
      const NUMBER_OF_REFERENCES = 2;
      const NUMBER_OF_PROPERTY_REFERENCE = 5;

      const references = getDataFromService({
        service,
        type: REFERENCE,
      });
      expect(references).toHaveLength(NUMBER_OF_REFERENCES);

      const reference: Reference = references[0];
      expect(Object.keys(reference)).toHaveLength(NUMBER_OF_PROPERTY_REFERENCE);
      expect(reference.qualifier).toBeDefined();
      expect(reference.serviceName).toBeDefined();
      expect(reference.methodName).toBeDefined();
      expect(reference.reference).toBeDefined();
      expect(reference.asyncModel).toBeDefined();
    });

    it('Test getDataFromService({ service, type }) : Endpoint[]', () => {
      const NUMBER_OF_END_POINTS = 2;
      const NUMBER_OF_PROPERTY_END_POINT = 6;

      const endPoints = getDataFromService({
        service,
        type: END_POINT,
      });
      expect(endPoints).toHaveLength(NUMBER_OF_END_POINTS);

      const endPoint: Endpoint = endPoints[0];
      expect(Object.keys(endPoint)).toHaveLength(NUMBER_OF_PROPERTY_END_POINT);
      expect(endPoint.qualifier).toBeDefined();
      expect(endPoint.serviceName).toBeDefined();
      expect(endPoint.methodName).toBeDefined();
      expect(endPoint.transport).toBeDefined();
      expect(endPoint.uri).toBeDefined();
      expect(endPoint.asyncModel).toBeDefined();
    });
  });
});

import { Reference, Service } from '../api';
import { GreetingService, greetingServiceDefinition } from '../../tests/mocks/GreetingService';
import { getQualifier } from '../helpers/serviceData';
import {
  createMethodRegistry,
  getReferenceFromService,
  getReferenceFromServices,
  getUpdatedMethodRegistry,
} from './MethodRegistry';
import { ASYNC_MODEL_TYPES, DEFINITION_MISSING_METHODS } from '../helpers/constants';

describe('ServiceRegistry Testing', () => {
  const address = 'address';
  describe('Test ServiceRegistry factory', () => {
    let registry: any;

    beforeEach(() => {
      registry && registry.destroy();
      registry = createMethodRegistry();
    });

    const service: Service = {
      definition: greetingServiceDefinition,
      reference: new GreetingService(),
    };

    it('Test after createMethodRegistry(): MethodRegistry - all methods are define', () => {
      const NUMBER_OF_REGISTRY_PROPERTIES = 3;

      expect(registry.lookUp).toBeDefined();
      expect(registry.add).toBeDefined();
      expect(registry.destroy).toBeDefined();

      expect(Object.keys(registry)).toHaveLength(NUMBER_OF_REGISTRY_PROPERTIES);
    });

    it('Test add({ services }): AvailableServices - add reference for each method no matter how many of the same services we add', () => {
      const services = [service, service, service, service];
      const NUMBER_OF_SERVICES = Object.keys(service).length;
      const methodRegistry = registry.add({
        services,
      });

      const references = Object.keys(methodRegistry);
      expect(references).toHaveLength(NUMBER_OF_SERVICES);
    });

    it('Test add({ services }): AvailableServices - without services', () => {
      const methodRegistry = registry.add({});
      expect(methodRegistry).toMatchObject({});
    });

    it('Test lookUp ({ qualifier }): Reference | null - return null if qualifier not found', () => {
      registry.add({
        services: [service],
      });

      const emptyResult = registry.lookUp({ qualifier: 'fakeQualifier' });
      expect(emptyResult).toBe(null);
    });

    it('Test lookUp ({ qualifier }): Reference | null - return reference if qualifier found', () => {
      registry.add({
        services: [service],
      });
      const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
      const reference = registry.lookUp({ qualifier });
      expect(reference).toEqual(
        expect.objectContaining({
          asyncModel: expect.any(String),
          methodName: expect.any(String),
          qualifier: expect.any(String),
          serviceName: expect.any(String),
          reference: expect.any(Object),
        })
      );
    });
  });

  describe('Test destroy() : null', () => {
    const registry: any = createMethodRegistry();
    const qualifier = 'falseQualifier';
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

    it('Test getReferenceFromServices({ services }) : Reference[] | [] -  create reference for each method in each service', () => {
      const services = [service, service, service];
      const NUMBER_OF_REFERENCES = Object.keys(service).length * services.length;
      const references: Reference[] = getReferenceFromServices({
        services,
        address,
      });

      expect(references).toHaveLength(NUMBER_OF_REFERENCES);
    });

    it('Test getReferenceFromServices({ services }) : Reference[] | [] -  without parameters', () => {
      const references: Reference[] = getReferenceFromServices({ address });

      expect(Array.isArray(references)).toBeTruthy();
      expect(references).toHaveLength(0);
    });

    it('Test getUpdatedMethodRegistry({ methodRegistry, references }) - save only 1 reference per qualifier in the methodRegistry', () => {
      const NUMBER_OF_REFERENCES = 1;

      const qualifier = 'qualifier';

      const reference: Reference = {
        qualifier,
        serviceName: 'serviceName',
        methodName: 'methodName',
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
        reference: {
          fakeMethod: () => {},
        },
      };
      const methodRegistryMap = {
        [qualifier]: reference,
      };

      const immutableMethodRegistry = getUpdatedMethodRegistry({
        methodRegistryMap,
        references: [reference, reference, reference],
      });

      expect(immutableMethodRegistry === methodRegistryMap).toBe(false);
      expect(Object.keys(immutableMethodRegistry)).toHaveLength(NUMBER_OF_REFERENCES);
    });

    it('Test getReferenceFromService({ service }) : Reference[]', () => {
      const NUMBER_OF_REFERENCES = 2;
      const NUMBER_OF_PROPERTY_REFERENCE = 5;

      const references = getReferenceFromService({
        service,
        address,
      });
      expect(references).toHaveLength(NUMBER_OF_REFERENCES);

      const reference: Reference = references[0];
      expect(Object.keys(reference)).toHaveLength(NUMBER_OF_PROPERTY_REFERENCE);
      expect(reference).toEqual(
        expect.objectContaining({
          asyncModel: expect.any(String),
          methodName: expect.any(String),
          qualifier: expect.any(String),
          reference: expect.any(Object),
          serviceName: expect.any(String),
        })
      );
    });
  });
});

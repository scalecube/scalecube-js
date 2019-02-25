import { Reference, Service } from '../api/public';
import { greetingServiceDefinition } from '../../__mocks__/GreetingService';
import GreetingService from '../../__mocks__/GreetingService';
import { getQualifier } from '../helpers/serviceData';
import {
  createMethodRegistry,
  getReferenceFromService,
  getReferenceFromServices,
  getUpdatedMethodRegistry,
} from './methodRegistry';

describe('ServiceRegistry Testing', () => {
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

    it('Test after createMethodRegistry(): ServiceRegistry - all methods are define', () => {
      const NUMBER_OF_REGISTRY_PROPERTIES = 3;

      expect(registry.lookUp).toBeDefined();
      expect(registry.add).toBeDefined();
      expect(registry.destroy).toBeDefined();

      expect(Object.keys(registry)).toHaveLength(NUMBER_OF_REGISTRY_PROPERTIES);
    });

    it('Test add({ services }): AvailableServices', () => {
      const methodRegistry = registry.add({
        services: [service, service],
      });

      const qualifiers = Object.keys(methodRegistry);
      expect(qualifiers).toHaveLength(2);
    });

    it('Test lookUp ({ qualifier }): Reference | null', () => {
      registry.add({
        services: [service],
      });

      const emptyResult = registry.lookUp({ qualifier: 'fakeQualifier' });
      expect(emptyResult).toBe(null);

      const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
      const result = registry.lookUp({ qualifier });
      expect(result).toEqual(
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
    const service: Service = {
      definition: greetingServiceDefinition,
      reference: new GreetingService(),
    };

    it('Test getReferenceFromServices({ services }) : Reference[] | []', () => {
      const NUMBER_OF_REFERENCES = 6;
      const references: Reference[] = getReferenceFromServices({
        services: [service, service, service],
      });

      expect(references).toHaveLength(NUMBER_OF_REFERENCES);
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

    it('Test getDataFromService({ service, type }) : Reference[]', () => {
      const NUMBER_OF_REFERENCES = 2;
      const NUMBER_OF_PROPERTY_REFERENCE = 5;

      const references = getReferenceFromService({
        service,
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

import { Microservices } from './Microservices';
import { Service } from '../api/public';
import { greetingServiceDefinition } from '../../__mocks__/GreetingService';
import GreetingService from '../../__mocks__/GreetingService';
import { defaultRouter } from '../Routers/default';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';

describe('Microservices Testing', () => {
  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };
  const greetingService2: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };
  const microserviceOptions = {
    services: [greetingService1, greetingService2],
  };

  describe('Microservices create', () => {
    const microservice = Microservices.create(microserviceOptions);

    it('Test Microservice.create({ services }: MicroserviceOptions): Microservice', () => {
      const NUMBER_OF_MICROSERVICE_PROPERTIES = 3;

      expect(Object.keys(microservice)).toHaveLength(NUMBER_OF_MICROSERVICE_PROPERTIES);

      expect(microservice.createProxy).toBeDefined();
      expect(microservice.createServiceCall).toBeDefined();
      expect(microservice.destroy).toBeDefined();
    });

    it('Test createServiceCall({ router = defaultRouter }):ServiceCall', () => {
      const serviceCall = microservice.createServiceCall({ router: defaultRouter });

      expect(serviceCall.requestStream).toBeDefined();
      expect(serviceCall.requestResponse).toBeDefined();
    });
  });
  describe('Microservices destroy', () => {
    const microservice = Microservices.create(microserviceOptions);
    const microserviceDeleted = microservice.destroy();

    it('Test destory return null', () => {
      expect(microserviceDeleted).toBe(null);
    });

    it('Test createProxy after microservice.destroy', () => {
      try {
        const proxy = microservice.createProxy({
          router: defaultRouter,
          serviceDefinition: greetingServiceDefinition,
        });
      } catch (e) {
        expect(e.message).toMatch(MICROSERVICE_NOT_EXISTS);
      }
    });

    it('Test createProxy after microservice.destroy', () => {
      try {
        const serviceCall = microservice.createServiceCall({
          router: defaultRouter,
        });
      } catch (e) {
        expect(e.message).toMatch(MICROSERVICE_NOT_EXISTS);
      }
    });

    it('Test destroy after microservice.destroy', () => {
      try {
        const destroy = microservice.destroy();
      } catch (e) {
        expect(e.message).toMatch(MICROSERVICE_NOT_EXISTS);
      }
    });
  });
});

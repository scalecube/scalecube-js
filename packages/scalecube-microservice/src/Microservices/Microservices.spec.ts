import { Microservices } from './Microservices';
import { Message, Service } from '../api/public';
import { greetingServiceDefinition } from '../../tests/mocks/GreetingService';
import GreetingService from '../../tests/mocks/GreetingService';
import { defaultRouter } from '../Routers/default';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { getQualifier } from '../helpers/serviceData';

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

    describe('Test createServiceCall({ router = defaultRouter }):ServiceCall', () => {
      const serviceCall = microservice.createServiceCall({ router: defaultRouter });

      it('Test createServiceCall methods', () => {
        const NUMBER_OF_SERVICE_CALLS = 2;
        expect(Object.keys(serviceCall)).toHaveLength(NUMBER_OF_SERVICE_CALLS);

        expect(serviceCall.requestStream).toBeDefined();
        expect(serviceCall.requestResponse).toBeDefined();
      });

      it('Test requestStream(message):ServiceCallOptions', (done) => {
        const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'greet$' });
        const message: Message = {
          data: [['fake message']],
          qualifier,
        };
        serviceCall.requestStream(message).subscribe((response: any) => {
          expect(response.data).toMatch(`greetings ${message.data}`);
          done();
        });
      });

      it('Test requestResponse(message):ServiceCallOptions', (done) => {
        const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
        const message: Message = {
          data: ['fake message'],
          qualifier,
        };
        serviceCall.requestResponse(message).then((response: any) => {
          expect(response.data).toMatch(`Hello ${message.data}`);
          done();
        });
      });
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

    it('Test createServiceCall after microservice.destroy', () => {
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

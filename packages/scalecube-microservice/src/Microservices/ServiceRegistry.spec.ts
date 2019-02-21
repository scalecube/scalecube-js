import { Microservices } from './Microservices';
import { Endpoint, Service } from '../api/public';
import { greetingServiceDefinition } from '../../__mocks__/GreetingService';
import GreetingService from '../../__mocks__/GreetingService';
import { lookUp } from './Registry';

describe('Registry Testing', () => {
  const qualifier = 'someService';
  const endPoint: Endpoint = {
    uri: '',
    qualifier,
    transport: '',
    serviceName: 'fakeServiceName',
    methodName: 'fakeMethodName',
    methodPointer: {},
    context: {},
  };
  it('Test lookUp({ qualifier, serviceRegistry }: LookupOptions): Endpoint[] | [] - success', () => {
    const serviceRegistry = {
      [qualifier]: [endPoint, endPoint],
    };

    const result = lookUp({ qualifier, serviceRegistry });
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject(endPoint);

    const emptyResult = lookUp({ qualifier: 'wrongQualifier', serviceRegistry });
    expect(emptyResult).toHaveLength(0);
  });

  it('Test lookUp({ qualifier, serviceRegistry }: LookupOptions): Endpoint[] | [] - fail', () => {
    const serviceRegistry = {
      [qualifier]: [endPoint, endPoint],
    };

    const emptyResult = lookUp({ qualifier: 'wrongQualifier', serviceRegistry });
    expect(emptyResult).toHaveLength(0);
  });

  it('Test addServicesToRegistry({services = [],serviceRegistry}: AddServicesToRegistryOptions): Registry', () => {});

  it('Test getEndpointsFromService({ service }: { service: Service }): Endpoint[] | []', () => {});
});

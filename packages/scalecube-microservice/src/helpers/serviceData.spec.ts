import { getServiceNamespace, getServiceName, getServiceMeta, getMethodName } from './serviceData';
import { createHelloService } from '../../__mocks__/GreetingService';

describe('serviceData', () => {
  const helloService = createHelloService();

  it('getServiceNamespace', () => {
    expect(getServiceNamespace(helloService)).toMatch(
      `${helloService.meta.serviceName}/${helloService.meta.methodName}`
    );
  });

  it('getServiceName', () => {
    expect(getServiceName(helloService)).toMatch(helloService.meta.serviceName);
  });

  it('getMethodName', () => {
    expect(getMethodName(helloService)).toMatch(helloService.meta.methodName);
  });

  it('getServiceMeta', () => {
    const meta = getServiceMeta(helloService);
    expect(meta.serviceName).toMatch(helloService.meta.serviceName);
    expect(meta.methodName).toMatch(helloService.meta.methodName);
    expect(meta.asyncModel).toMatch(helloService.meta.asyncModel);
  });
});

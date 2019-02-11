import { generateUUID } from '../src/helpers/utils';

export const fakeLazyService = {
  identifier: `${generateUUID()}`,
  meta: {
    isLazy: true,
    serviceName: 'fakeService',
    methodName: 'fakeMethod',
    asyncModel: 'Promise',
  },
  fakeMethod: {
    loader: () =>
      import('./FakeService')
        .then((service: any) => new service.default())
        .catch((err) => console.error(new Error(`Unable to import the service ${err}`))),
  },
};

export const fakeService = {
  identifier: `${generateUUID()}`,
  meta: {
    isLazy: false,
    serviceName: 'fakeService',
    methodName: 'fakeMethod',
    asyncModel: 'Promise',
  },
  fakeMethod: (data) => Promise.resolve({ request: data, response: fakeMethodResponse }),
};

export const fakeMessage = {
  serviceName: 'fakeService',
  methodName: 'fakeMethod',
  data: ['fakeMessage'],
  proxy: null,
};

export const fakeMethodResponse = 'fakeMethodResponse';

export default class FakeService {
  public fakeMethod() {
    return Promise.resolve(fakeMethodResponse);
  }
}

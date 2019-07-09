import { MicroserviceApi } from '@scalecube/api';

export const defaultRouter: MicroserviceApi.Router = Object.freeze({
  route: ({ message, lookUp }: MicroserviceApi.RouterOptions) => {
    const { qualifier } = message;
    const endpoints = lookUp({ qualifier });
    if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
      return null;
    } else {
      return endpoints[0];
    }
  },
});

import { RouterApi } from '@scalecube/api';

export const defaultRouter: RouterApi.Router = (options) => {
  const { message, lookUp } = options;
  const { qualifier } = message;
  const endpoints = lookUp({ qualifier });
  if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
    return null;
  } else {
    return endpoints[0];
  }
};

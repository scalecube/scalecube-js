import { MicroserviceApi } from '@scalecube/api';

export const defaultRouter: MicroserviceApi.Router = (options: MicroserviceApi.RouterOptions) => {
  const { message, lookUp } = options;
  const { qualifier } = message;
  return new Promise<MicroserviceApi.Endpoint>((resolve, reject) => {
    const endpoints = lookUp({ qualifier });
    if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
      reject(null);
    } else {
      resolve(endpoints[0]);
    }
  });
};

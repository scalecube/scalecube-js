import { MicroserviceApi } from '@scalecube/api';

export const retryRouter = ({ period, maxRetry }: { period: number; maxRetry?: number }) => {
  return (options: MicroserviceApi.RouterOptions) => {
    const { message, lookUp } = options;
    const { qualifier } = message;
    let retry = 0;
    return new Promise<MicroserviceApi.Endpoint>((resolve, reject) => {
      const checkRegistry = () => {
        const endpoints = lookUp({ qualifier });
        if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
          if (maxRetry && maxRetry >= retry) {
            retry++;
          }

          if (!maxRetry || maxRetry >= retry) {
            setTimeout(() => {
              checkRegistry();
            }, period);
          } else {
            reject(null);
          }
        } else {
          resolve(endpoints[0]);
        }
      };

      checkRegistry();
    });
  };
};

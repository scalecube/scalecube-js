import { MicroserviceApi } from '@scalecube/api';
import { createMicroservice, ASYNC_MODEL_TYPES } from '../../src';
import { TransportBrowser } from '@scalecube/transport-browser';
import { joinCluster } from '@scalecube/cluster-browser';
import { retryRouter } from '@scalecube/routers';

export { ASYNC_MODEL_TYPES };

export const createMS: MicroserviceApi.CreateMicroservice = (config) => {
  const ms = createMicroservice({
    // @ts-ignore
    transport: TransportBrowser,
    cluster: joinCluster,
    ...config,
  });

  return {
    createProxy: (options) => {
      return ms.createProxy({
        router: retryRouter({ period: 10, maxRetry: 50 }),
        ...options,
      });
    },
    createServiceCall: (options) => {
      return ms.createServiceCall({
        router: retryRouter({ period: 10, maxRetry: 50 }),
        ...options,
      });
    },
    destroy: ms.destroy,
  };
};

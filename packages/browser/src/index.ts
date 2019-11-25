import { MicroserviceApi } from '@scalecube/api';
import {
  createMicroservice as msCreate,
  ASYNC_MODEL_TYPES,
  workers,
  stringToAddress,
} from '@scalecube/scalecube-microservice';
import { TransportBrowser } from '@scalecube/transport-browser';
import { joinCluster } from '@scalecube/cluster-browser';
import { retryRouter } from '@scalecube/routers';

export { ASYNC_MODEL_TYPES, workers, stringToAddress };

export const createMicroservice: MicroserviceApi.CreateMicroservice = (config: any) => {
  return msCreate({
    // @ts-ignore
    transport: TransportBrowser,
    cluster: joinCluster,
    defaultRouter: retryRouter({ period: 10, maxRetry: 500 }),
    ...config,
  });
};
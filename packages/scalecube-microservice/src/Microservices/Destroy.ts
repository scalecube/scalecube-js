import { Destroy } from '../helpers/types';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { loggerUtil } from '../helpers/logger';

export const destroy = (options: Destroy) => {
  const { discovery, serverStop, transportClientDestroy } = options;
  let { microserviceContext } = options;

  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }
  const logger = loggerUtil(microserviceContext.whoAmI, microserviceContext.debug);

  return new Promise((resolve, reject) => {
    if (microserviceContext) {
      const { localRegistry, remoteRegistry } = microserviceContext;
      localRegistry.destroy();
      remoteRegistry.destroy();
      transportClientDestroy({ address: microserviceContext.whoAmI, logger });
    }

    serverStop && serverStop();

    discovery &&
      discovery.destroy().then(() => {
        resolve('');
        microserviceContext = null;
      });
  });
};

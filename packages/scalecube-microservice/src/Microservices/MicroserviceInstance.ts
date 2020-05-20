import { DiscoveryApi, MicroserviceApi } from '@scalecube/api';
import { saveToLogs } from '@scalecube/utils';
import { tap } from 'rxjs/operators';
import { GetServiceFactoryOptions, SetMicroserviceInstanceOptions } from '../helpers/types';
import { createProxy } from '../Proxy/createProxy';
import { destroy } from './Destroy';
import { createServiceCall } from '../ServiceCall/ServiceCall';

export const setMicroserviceInstance = (options: SetMicroserviceInstanceOptions): MicroserviceApi.Microservice => {
  const { transportClient, serverStop, discoveryInstance, debug, defaultRouter, microserviceContext } = options;

  const { remoteRegistry } = microserviceContext;

  discoveryInstance &&
    discoveryInstance
      .discoveredItems$()
      .pipe(printLogs(microserviceContext.whoAmI, debug))
      .subscribe(remoteRegistry.update);

  const serviceFactoryOptions = getServiceFactoryOptions({
    microserviceContext,
    transportClient,
    defaultRouter,
  });
  return Object.freeze({
    destroy: () =>
      destroy({
        microserviceContext,
        discovery: discoveryInstance,
        serverStop,
        transportClientDestroy: transportClient.destroy,
      }),
    ...serviceFactoryOptions,
  });
};

export const getServiceFactoryOptions = ({
  microserviceContext,
  transportClient,
  defaultRouter,
}: GetServiceFactoryOptions) =>
  ({
    createProxy: ({ serviceDefinition, router = defaultRouter }: MicroserviceApi.ProxyOptions) =>
      createProxy({
        serviceDefinition,
        router,
        microserviceContext,
        transportClient,
      }),
    createServiceCall: ({ router = defaultRouter }: { router: MicroserviceApi.Router }) =>
      createServiceCall({
        router,
        microserviceContext,
        transportClient,
      }),
  } as MicroserviceApi.ServiceFactoryOptions);

const printLogs = (whoAmI: string, debug?: boolean) =>
  tap(
    ({ type, items }: DiscoveryApi.ServiceDiscoveryEvent) =>
      type !== 'IDLE' &&
      saveToLogs(
        whoAmI,
        `microservice received an updated`,
        {
          [type]: items.map((item: MicroserviceApi.Endpoint) => item.qualifier),
        },
        debug
      )
  );

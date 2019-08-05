import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { DiscoveryApi, Endpoint, MicroserviceApi } from '@scalecube/api';
import { RemoteRegistry } from './types';

import { getQualifier } from '@scalecube/utils';
export { getQualifier };

export const getReferencePointer = ({
  reference,
  methodName,
}: {
  reference: MicroserviceApi.ServiceReference;
  methodName: string;
}): ((...args: any[]) => any) => {
  const methodRef = reference[methodName];
  if (methodRef) {
    return methodRef.bind(reference);
  }
  // static method
  return reference.constructor && reference.constructor[methodName];
};

const confirmMethods = (
  endPoints: Endpoint[],
  serviceDefinition: MicroserviceApi.ServiceDefinition,
  unConfirmedMethods: string[]
) => {
  endPoints.forEach((endPoint: Endpoint) => {
    if (endPoint.serviceName === serviceDefinition.serviceName) {
      const removeAt = unConfirmedMethods.indexOf(endPoint.methodName);
      if (removeAt !== -1) {
        unConfirmedMethods.splice(removeAt, 1);
      }
    }
  });
};

const confirmInRegistry = (
  serviceDefinition: MicroserviceApi.ServiceDefinition,
  unConfirmedMethods: string[],
  remoteRegistry: RemoteRegistry
) => {
  unConfirmedMethods.forEach((methodName) => {
    const qualifier = getQualifier({ serviceName: serviceDefinition.serviceName, methodName });
    if (remoteRegistry.lookUp({ qualifier }).length > 0) {
      const removeAt = unConfirmedMethods.indexOf(methodName);
      if (removeAt !== -1) {
        unConfirmedMethods.splice(removeAt, 1);
      }
    }
  });
};

export const isServiceAvailableInRegistry = (
  endPointsToPublishInCluster: Endpoint[],
  remoteRegistry: RemoteRegistry,
  discovery: {
    discoveredItems$: () => Observable<any>;
  }
) => {
  return (serviceDefinition: MicroserviceApi.ServiceDefinition): Promise<boolean> => {
    const unConfirmedMethods = Object.keys(serviceDefinition.methods);

    return new Promise((resolve, reject) => {
      confirmMethods(endPointsToPublishInCluster, serviceDefinition, unConfirmedMethods);
      if (unConfirmedMethods.length === 0) {
        resolve(true);
      }

      confirmInRegistry(serviceDefinition, unConfirmedMethods, remoteRegistry);
      if (unConfirmedMethods.length === 0) {
        resolve(true);
      }

      discovery
        .discoveredItems$()
        .pipe(
          takeWhile((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
            if (discoveryEvent.type === 'REGISTERED') {
              const discoveryEndpoints = discoveryEvent.items;
              confirmMethods(discoveryEndpoints as Endpoint[], serviceDefinition, unConfirmedMethods);
            }

            if (unConfirmedMethods.length === 0) {
              resolve(true);
            }

            return unConfirmedMethods.length > 0;
          })
        )
        .subscribe();
    });
  };
};

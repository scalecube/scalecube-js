import { Qualifier } from './types';
import { Endpoint, ServiceDefinition, ServiceReference } from '../api';
import { Observable } from 'rxjs';

export const getQualifier = ({ serviceName, methodName }: Qualifier) => `${serviceName}/${methodName}`;

export const getReferencePointer = ({
  reference,
  methodName,
}: {
  reference: ServiceReference;
  methodName: string;
}): ((...args: any[]) => any) => {
  const methodRef = reference[methodName];
  if (methodRef) {
    return methodRef.bind(reference);
  }
  // static method
  return reference.constructor && reference.constructor[methodName];
};

const confirmMethods = (endPoints: Endpoint[], serviceDefinition: ServiceDefinition, unConfirmedMethods: string[]) => {
  endPoints.forEach((endPoint: Endpoint) => {
    if (endPoint.serviceName === serviceDefinition.serviceName) {
      const removeAt = unConfirmedMethods.indexOf(endPoint.methodName);
      if (removeAt !== -1) {
        unConfirmedMethods.splice(removeAt, 1);
      }
    }
  });
};

export const isServiceAvailableInRegistry = (
  endPointsToPublishInCluster: Endpoint[],
  discovery: { discoveredItems$: () => Observable<any> }
) => {
  return (serviceDefinition: ServiceDefinition): Promise<boolean> => {
    const unConfirmedMethods = Object.keys(serviceDefinition.methods);

    return new Promise((resolve, reject) => {
      confirmMethods(endPointsToPublishInCluster, serviceDefinition, unConfirmedMethods);
      if (unConfirmedMethods.length === 0) {
        resolve(true);
      }

      discovery.discoveredItems$().subscribe((discoveryEndpoints: any[]) => {
        confirmMethods(discoveryEndpoints as Endpoint[], serviceDefinition, unConfirmedMethods);

        if (unConfirmedMethods.length === 0) {
          resolve(true);
        }
      });
    });
  };
};

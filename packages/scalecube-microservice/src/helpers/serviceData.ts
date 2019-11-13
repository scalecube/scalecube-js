import { MicroserviceApi } from '@scalecube/api';
import { check } from '@scalecube/utils';
import { FlatteningServices } from './types';
import { getServiceFactoryOptions } from '../Microservices/MicroserviceInstance';
import { validateServiceReference } from './validation';

export const getReferencePointer = ({
  reference,
  methodName,
}: {
  reference: MicroserviceApi.ServiceObject;
  methodName: string;
}): ((...args: any[]) => any) => {
  const methodRef = reference[methodName];
  if (methodRef) {
    return methodRef.bind(reference);
  }
  // static method
  return reference.constructor && reference.constructor[methodName];
};

export const flatteningServices = ({ services, serviceFactoryOptions }: FlatteningServices) => {
  return services && Array.isArray(services)
    ? services.map((service: MicroserviceApi.Service) => {
        const { reference, definition } = service;
        if (check.isFunction(reference)) {
          const ref = (reference as (...data: any[]) => any)(serviceFactoryOptions);
          validateServiceReference(ref, definition);
          return { reference: ref, definition };
        } else {
          validateServiceReference(reference, definition);
          return { reference, definition };
        }
      })
    : services;
};

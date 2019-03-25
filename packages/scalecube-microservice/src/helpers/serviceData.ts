import { Qualifier } from './types';
import { isFunction } from './utils';
import { ServiceImplementationForModule, ServiceImplementationForObject } from '../api';
import ServiceImplementation from '../api/ServiceImplementation';
import { getInvalidMethodReferenceError } from './constants';

export const getQualifier = ({ serviceName, methodName }: Qualifier) => `${serviceName}/${methodName}`;

export const getReferencePointer = ({
  reference,
  methodName,
  qualifier,
}: {
  reference: ServiceImplementation;
  methodName: string;
  qualifier: string;
}): ((...args: any[]) => any) => {
  let func: (...args: any[]) => any;
  if (isFunction(reference)) {
    func = reference as ServiceImplementationForModule;
  } else {
    if (!isFunction((reference as ServiceImplementationForObject)[methodName])) {
      // Check if method is static
      if (
        !isFunction(
          (reference as { constructor: { [methodName: string]: (...args: any[]) => any } }).constructor[methodName]
        )
      ) {
        throw new Error(getInvalidMethodReferenceError(qualifier));
      } else {
        func = (reference as { constructor: { [methodName: string]: (...args: any[]) => any } }).constructor[
          methodName
        ];
      }
    } else {
      func = (reference as ServiceImplementationForObject)[methodName].bind(reference);
    }
  }

  return func;
};

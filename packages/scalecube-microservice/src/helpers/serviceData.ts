import { Qualifier } from './types';
import { isFunction } from './utils';
import { ServiceReference } from '../api';
import { getInvalidMethodReferenceError } from './constants';

export const getQualifier = ({ serviceName, methodName }: Qualifier) => `${serviceName}/${methodName}`;

export const getReferencePointer = ({
  reference,
  methodName,
  qualifier,
}: {
  reference: ServiceReference;
  methodName: string;
  qualifier: string;
}): ((...args: any[]) => any) => {
  let func: (...args: any[]) => any;

  if (typeof reference !== 'object' || reference === null) {
    throw new Error(getInvalidMethodReferenceError(qualifier));
  } else {
    if (!isFunction(reference[methodName])) {
      // Check if method is static
      if (!isFunction(reference.constructor[methodName])) {
        throw new Error(getInvalidMethodReferenceError(qualifier));
      } else {
        func = reference.constructor[methodName];
      }
    } else {
      func = reference[methodName].bind(reference);
    }
  }

  return func;
};

import { Qualifier } from '../api/private/types';
import { isFunction } from './utils';
import { ServiceImplementationForModule, ServiceImplementationForObject } from '../api/public';
import ServiceImplementation from '../api/public/ServiceImplementation';
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
      throw new Error(getInvalidMethodReferenceError(qualifier));
    }
    func = (reference as ServiceImplementationForObject)[methodName].bind(reference);
  }

  return func;
};

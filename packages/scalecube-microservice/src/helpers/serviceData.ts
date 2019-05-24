import { Qualifier } from './types';
import { ServiceReference } from '../api';

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
  //static method
  return reference.constructor && reference.constructor[methodName];
};

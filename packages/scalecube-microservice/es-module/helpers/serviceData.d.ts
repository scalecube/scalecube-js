import { Qualifier } from './types';
import ServiceImplementation from '../api/ServiceImplementation';
export declare const getQualifier: ({ serviceName, methodName }: Qualifier) => string;
export declare const getReferencePointer: ({
  reference,
  methodName,
  qualifier,
}: {
  reference: ServiceImplementation;
  methodName: string;
  qualifier: string;
}) => (...args: any[]) => any;

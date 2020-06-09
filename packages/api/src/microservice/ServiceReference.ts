import { CreateProxy } from './CreateProxy';
import { CreateServiceCall } from './CreateServiceCall';

/**
 * @function ServiceReference
 * Map: key<method>  and value<reference>(to service method)
 */
export type ServiceReference = ServiceFactory | ServiceObject;

export type ServiceFactory = ({ createProxy, createServiceCall }: ServiceFactoryOptions) => ServiceObject;

export interface ServiceObject {
  constructor?: any;

  [methodName: string]: any;
}

export interface ServiceFactoryOptions {
  createProxy: CreateProxy;
  createServiceCall: CreateServiceCall;
}

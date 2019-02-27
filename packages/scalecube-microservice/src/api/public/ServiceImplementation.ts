export interface ServiceImplementationForObject {
  [methodName: string]: any;
}

export type ServiceImplementationForModule = (...args: any[]) => any;

type ServiceImplementation = ServiceImplementationForObject | ServiceImplementationForModule;

export default ServiceImplementation;

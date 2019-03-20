/**
 * The map of methods with their implementations
 */
export interface ServiceImplementationForObject {
  [methodName: string]: any;
}
/**
 * Function that is exported from a module
 */
export type ServiceImplementationForModule = (...args: any[]) => any;
/**
 * The implementation of the service
 */
type ServiceImplementation = ServiceImplementationForObject | ServiceImplementationForModule;

export default ServiceImplementation;

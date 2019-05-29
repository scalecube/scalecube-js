import { ServiceDefinition } from './index';
/**
 * The options that are used for the creation of the proxy for the specific microservice container
 */
export default interface MultipleProxyOptions {
  /**
   * A map <proxyName:string, serviceDefinition: ServiceDefinition>
   */
  [proxyName: string]: ServiceDefinition;
}

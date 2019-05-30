import { ServiceDefinition } from './index';

/**
 * options for creating proxies
 */
export default interface ProxiesOptions {
  /**
   * name of the proxy (used as the key in the map)
   */
  proxyName: string;
  /**
   * metadata of the service
   */
  serviceDefinition: ServiceDefinition;
}

import { Service } from '.';
import { Address, TransportApi, DiscoveryApi } from '@scalecube/api';

/**
 * @interface MicroserviceOptions
 * The options for the creation of a microservice container
 */
export default interface MicroserviceOptions {
  /**
   * @property
   * An array of services, that will exist inside a microservice container
   */
  services?: Service[];
  /**
   * @property
   * The seedAddress is an address of another microservice container in our distributed env.
   * seedAddress is the entry point to our distributed env.
   * if seedAddress is not provided, then the microservice instance can only wait for some other microserivce instance to connect to it.
   */
  seedAddress?: Address | string;
  /**
   * @property
   * An address for this microservice instance
   * other microservices can use this address to connect with this microservice container.
   */
  address?: Address | string;
  /**
   * @property
   * Pluggable transport-browser,
   * a module that implements MicroserviceTransport.
   * transport-browser responsible to open connection between two microservices container.
   * the client side will use remoteTransportClient to request the remote microservice to invoke a method.
   * the server side will use remoteTransportServer to invoke and method and send back the response of the method that been invoked.
   */
  transport?: TransportApi.Transport;
  /**
   * @method
   * Pluggable discovery,
   * a module that implements discovery API
   * discovery responsible to exchange data in the distributed env.
   */
  discovery?: (opt: DiscoveryApi.DiscoveryOptions) => DiscoveryApi.Discovery;
}

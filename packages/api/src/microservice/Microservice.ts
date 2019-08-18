import { Address } from '../index';
import { Cluster, ClusterOptions } from '../cluster';
import { CreateProxies, CreateProxy, CreateServiceCall, Service } from '.';

/**
 * @function CreateMicroservice
 * The factory for the creation of microservice containers
 */
export type CreateMicroservice = (options: MicroserviceOptions) => Microservice;

/**
 * @interface Microservice
 * Provides the functionality of a microservice container
 */
export interface Microservice {
  /**
   * @method destroy
   * The method is used to delete a microservice and close all the subscriptions related with it
   */
  destroy: () => Promise<any>;

  /**
   * @method createProxies
   * Create a map of proxies or Promises to proxy. (deepened on configuration)
   */
  createProxies: CreateProxies;

  /**
   * @method createProxy
   * Creates a proxy to a method and provides extra logic when is invoked
   */
  createProxy: CreateProxy;

  /**
   * @method createServiceCall
   * Exposes serviceCall to a user (not via Proxy)
   */
  createServiceCall: CreateServiceCall;
}

/**
 * @interface MicroserviceOptions
 * The options for the creation of a microservice container
 */
export interface MicroserviceOptions {
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
   * Pluggable transport,
   * a module that implements MicroserviceTransport.
   * transport-browser responsible to open connection between two microservices container.
   * the client side will use remoteTransportClient to request the remote microservice to invoke a method.
   * the server side will use remoteTransportServer to invoke and method and send back the response of the method that been invoked.
   */
  transport?: Transport;
  /**
   * @method
   * Pluggable cluster,
   * a module that implements Cluster API
   * cluster responsible to bootstrap the distributed env.
   */
  cluster?: (opt: ClusterOptions) => Cluster;
  /**
   * @property
   * add logs to the microservice container
   */
  debug?: boolean;
}

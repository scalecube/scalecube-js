import { Address } from '../index';
import { Message } from '../microservice';
import { Observable } from 'rxjs';

/**
 * @interface Transport
 *
 */
export interface Transport {
  /**
   * @property
   * transport layer for the client
   */
  clientTransport: ClientTransport;
  /**
   * @property
   * transport layer for the server
   */
  serverTransport: ServerTransport;
}

export interface ClientTransport {
  /**
   * @property start
   *  open connection to remote container and resolve with Invoker to call the remote container
   */
  start: (options: ClientTransportOptions) => Promise<Invoker>;
  /**
   * @method destroy
   *  remove open connection to a specific microserivce container
   */
  destroy: TDestroy;
}

export type ServerTransport = (options: ServerTransportOptions) => ServerStop;

export interface ClientTransportOptions {
  /**
   * @property remoteAddress
   * address of the remote microservice that contain the service we want to execute.
   */
  remoteAddress: Address;
  /**
   * @method logger
   *  add logs to scalecube eco-system
   */
  logger: TLogger;
}

/**
 * @interface ServerTransportOptions
 */
export interface ServerTransportOptions {
  /**
   * @property localAddress
   *  address this microservice container.
   */
  localAddress: Address;
  /**
   * @property serviceCall
   * callback for handling the request
   */
  serviceCall: Invoker;
  /**
   * @method logger
   *  add logs to scalecube eco-system
   */
  logger: TLogger;
}

/**
 * @interface Invoker
 */
export interface Invoker {
  /**
   * @method requestResponse
   * @message - data to pass in the request
   */
  requestResponse: (message: Message) => Promise<any>;
  /**
   * @method requestStream
   * @message - data to pass in the request
   */
  requestStream: (message: Message) => Observable<any>;
}

/**
 * @method destroy
 *  remove all open connections of this microservice container
 */
export type ServerStop = () => void;

export type TLogger = (msg: any, type: 'warn' | 'log') => void;

export type TDestroy = (options: TDestroyOptions) => void;

export interface TDestroyOptions {
  address: string;
  logger: TLogger;
}

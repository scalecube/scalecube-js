// @flow
export interface TransportRequest {
  /**
   * An object with all the additional options to configure the request (for instance type of request, responses limit)
   */
  headers: Object;
  /**
   * A part of an url that will be added to URI, that is set in provider (starts with "/")
   */
  entrypoint: string;
  /**
   * Custom data, that should be included in the request
   */
  data: any;
}

export interface TransportClientProviderConfig {
  /**
   * The path to a server
   */
  URI: string;
  /**
   * ms btw sending keepAlive to server
   */
  keepAlive?: number;
  /**
   * ms timeout if no keepAlive response
   */
  lifetime?: number;
  /**
   * Custom WebSocket class that will be used in the process of building a provider to create a webSocket instance with the provided URI
   */
  WebSocket?: any;
}

export interface TransportServerProviderConfig {
  /**
   * The host of the server
   * @default "0.0.0.0"
   */
  host?: string,
  /**
   * The port of the server
   * @default 8080
   */
  port?: number,
}

export interface PostMessageEventData {
  /**
   * Unique id of the request, that is generated automatically when new request is sent
   */
  requestId: number,
  /**
   * The data of the message
   */
  data: any;
  /**
   * The flag, that notifies if all the data for the request has been already sent
   */
  completed: boolean;
}

export interface ActiveRequest {
  /**
   * Instance of Subject for a specific request
   */
  subscriber: any;
  /**
   * The amount of responses that have been already sent due to this request
   */
  responsesCount: number;
  /**
   * The maximum amount of responses to be sent due to this request
   */
  responsesLimit?: number;
}

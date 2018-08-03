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

export interface ProviderConfig {
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

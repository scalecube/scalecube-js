// import { Api } from '@scalecube/scalecube-microservice';

export default interface Gateway {
  /**
   * gateway provider implementation
   * start to listen on a port (ws/ rsocket/ ...)
   * handle incoming requests
   */
  // start: (options: { serviceCall: Api.ServiceCall }) => void;
  start: (options: { serviceCall: any }) => void;
  /**
   * stop gateway
   */
  stop: () => void;
}

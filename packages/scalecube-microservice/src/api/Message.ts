/**
 * Data that is used for executing the call of service method
 */
export default interface Message {
  /**
   * The combination of serviceName and methodName: <serviceName/methodName>
   */
  qualifier: string;
  /**
   * Custom data, that is used used as an argument, when service method is called
   */
  data: any;
}

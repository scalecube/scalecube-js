/**
 * ServiceCall data
 */
export default interface Message {
  /**
   * The combination of serviceName and methodName: <serviceName/methodName>
   */
  qualifier: string;
  /**
   * Arguments of the invoked function
   */
  data: any;
}

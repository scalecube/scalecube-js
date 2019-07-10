/**
 * @interface Message
 * ServiceCall data
 */
export interface Message {
  /**
   * @property
   * The combination of serviceName and methodName: <serviceName/methodName>
   */
  qualifier: string;
  /**
   * @property
   * Arguments of the invoked function
   */
  data: any[];
}

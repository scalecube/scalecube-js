/**
 * The criteria, that is used to get endpoints from a registry
 */
export default interface LookupOptions {
  /**
   * The combination of serviceName and methodName: <serviceName/methodName>
   */
  qualifier: string;
}

/**
 * Map of generic proxyName and a Promise to the proxy
 */
export default interface ProxiesMap {
  [proxyName: string]: Promise<any> | any;
}

export default interface ProxiesMap {
  [proxyName: string]: Promise<any>;
}

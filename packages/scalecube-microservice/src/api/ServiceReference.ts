/**
 * Map: key<method>  and value<reference>(to service method)
 */

export default interface ServiceReference {
  constructor?: any;
  [methodName: string]: any;
}

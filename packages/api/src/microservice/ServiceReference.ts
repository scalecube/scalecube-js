/**
 * @interface ServiceReference
 * Map: key<method>  and value<reference>(to service method)
 */
export interface ServiceReference {
  constructor?: any;
  [methodName: string]: any;
}

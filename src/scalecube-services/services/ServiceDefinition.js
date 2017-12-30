// @flow
import { utils, ServicePromise } from 'src/scalecube-services/services'
type Methods = {[string]: (any)=>any};
export class ServiceDefinition {
  serviceInterface: any;
  serviceName: string;
  methods: Methods;
  /**
   * Constructor of service definition instance.
   *
   * @param serviceInterface the class of the service interface.
   * @param serviceName - the qualifier of the service.
   * @param methods - the methods to invoke the service.
   */
  constructor(serviceInterface: Object, serviceName: string, methods: Methods) {
    this.serviceInterface = utils.getServiceInterface(serviceInterface);
    this.serviceName = serviceName; // TODO check what to do with it if module
    this.methods = methods;
  }
  static getMethod(meta:any, service:any, key:string) {
    if( meta.type === 'Promise' ) {
      return service;
    } else {
      return service[key];
    }
  }
  static from(service: Object) {
    const methods = {};

    const meta = service.constructor.meta || service.meta;
    Object.keys(meta.methods).map((key)=>{
        methods[ key ] = ServiceDefinition.getMethod(meta, service, key);
    });
    return new ServiceDefinition(service, utils.getServiceName(service), methods);
  }
}

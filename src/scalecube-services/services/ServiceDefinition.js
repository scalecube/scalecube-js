// @flow
import { utils } from 'src/scalecube-services/services'
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

  static from(service: Object) {
    const methods = {};
    //const x = new service();
    Object.getOwnPropertyNames(Object.getPrototypeOf(service)).map((method) => {
      if (method !== 'constructor' && typeof service[ method ] === 'function') {
        methods[ method ] = service[ method ];
      }
    });

    return new ServiceDefinition(service, utils.getServiceName(service), methods);
  }
}

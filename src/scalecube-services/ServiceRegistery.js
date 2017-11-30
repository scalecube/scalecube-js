// @flow
export class ServiceRegistery {
  services: Object;
  constructor(serviceConfig) {
    this.services = this.services || {};
    serviceConfig.servicesConfig.map((sc)=>{
      let f = this.register(sc);
    });
    return this;
  }
  serviceLookup(name: string){
    return this.services[name];
  }
  register(serviceConfig: ServiceDefinition) {
    if(this.services[serviceConfig.serviceDefinition.serviceName]) {
      this.services[serviceConfig.serviceDefinition.serviceName].push(serviceConfig);
    } else {
      this.services[serviceConfig.serviceDefinition.serviceName] = [ serviceConfig ];
    }

  }
}
// @flow
import { ServicesConfig } from 'src/scalecube-services/services';

export class ServiceRegistery {
  services: Object;
  constructor(serviceConfig: ServicesConfig) {
    this.services = this.services || {};
    serviceConfig.servicesConfig.map((sc)=>{
      this.register(sc);
    });
    return this;
  }
  serviceLookup(name: string): any[]{
    return this.services[name] || [];
  }
  register(serviceConfig: ServicesConfig) {
    if(this.services[serviceConfig.serviceDefinition.serviceName]) {
      this.services[serviceConfig.serviceDefinition.serviceName].push(serviceConfig);
    } else {
      this.services[serviceConfig.serviceDefinition.serviceName] = [ serviceConfig ];
    }

  }
}
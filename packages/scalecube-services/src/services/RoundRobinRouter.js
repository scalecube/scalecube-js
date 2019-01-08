// @flow

import { ServiceRegistery, Message, Router, ServiceInstance } from ".";

export class RoundRobinServiceRouter implements Router {
  registry: ServiceRegistery;
  counter: Map<string, number>;
  constructor(registry: ServiceRegistery) {
    this.registry = registry;
    this.counter = new Map();
  }
  route(request: Message): ServiceInstance | null {
    const instances = this.registry.serviceLookup(request.serviceName)
      .filter(inst => inst.serviceDefinition.methods[request.method] !== "undefined" );

    if( instances.length > 1 ) {
      const index = ((this.counter.get(request.serviceName) || 0) + 1) % instances.length;
      this.counter.set(request.serviceName, index);
      return instances[index];
    } else if ( instances.length === 1 ) {
      return instances[0];
    } 
    return null;
    

  }
}

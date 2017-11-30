// @flow
import { MicroservicesBuilder, ServiceDefinition } from 'src/scalecube-services';

class Builder {
  servicesBuilder: ServicesConfig[];
  microservicesBuilder: MicroservicesBuilder;

  constructor(){
    this.servicesBuilder = [];
  }
  builder(builder: MicroservicesBuilder) {
    this.microservicesBuilder = builder;
  }
  build() { // TODO return Microservices.Builder
    return this.microservicesBuilder.services(
      new ServicesConfig(this.servicesBuilder));
  }
  services(...services:any) {
    services[0].map((o)=>{
      if( typeof o === 'function') {
        console.error(new Error(`${o.name} is a class not instance`));
      }
      this.add(new ServicesConfig(o));
    });
    return this;
  }
  add(serviceBuilder:ServicesConfig) {
    this.servicesBuilder.push(serviceBuilder);
    return this;
  }
  create() {
    return new ServicesConfig(this.servicesBuilder);
  }
}
//extends ServicesConfigApi
export class ServicesConfig{
  service;
  serviceDefinition;
  mcBuilder;
  servicesConfig;

  // public ServiceConfig(Object service) {
  // public ServiceConfig(Builder builder, Object service) {
  constructor(service: any, builder: ?Builder) {
    if( service && Array.isArray(service) ) {
      this.servicesConfig = service;
      return this;
    }
    if( builder && builder.constructor && builder.constructor.name !== 'Builder' ) {
      this.mcBuilder = builder;
    }
    this.service = service;
    this.serviceDefinition = ServiceDefinition.from(service);
    return this;
  }
  static builder(builder) {
    // TODO change it when splitting to files
    return new Builder(builder);
  }
}
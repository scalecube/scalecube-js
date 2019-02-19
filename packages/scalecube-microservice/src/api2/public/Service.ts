import ServiceDefinition from './ServiceDefinition';

export default interface Service {
  serviceDefinition: ServiceDefinition;
  service: {
    [methodName: string]: (arg: any) => any;
  };
}

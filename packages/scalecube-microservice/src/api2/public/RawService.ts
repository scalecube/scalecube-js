import ServiceDefinition from './ServiceDefinition';

export default interface RawService {
  serviceDefinition: ServiceDefinition;
  service: {
    [methodName: string]: (arg: any) => any;
  };
}

import ServiceDefinition from './ServiceDefinition';

export default interface RawService {
  identifier: string;
  serviceDefinition: ServiceDefinition;
  service: {
    [methodName: string]: (arg: any) => any;
  };
}

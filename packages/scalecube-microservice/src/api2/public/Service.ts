import ServiceDefinition from './ServiceDefinition';

export default interface Service {
  definition: ServiceDefinition;
  implementation: {
    [methodName: string]: (arg: any) => any;
  };
}

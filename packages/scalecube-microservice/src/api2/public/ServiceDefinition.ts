import AsyncModel from './AsyncModel';

export default interface ServiceDefinition {
  serviceName: string;
  methodName: string;
  asyncModel: AsyncModel;
}

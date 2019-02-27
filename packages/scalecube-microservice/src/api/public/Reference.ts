import AsyncModel from './AsyncModel';

export default interface Reference {
  qualifier: string; // <serviceName/methodName>
  serviceName: string;
  methodName: string;
  reference?: {
    [methodName: string]: (...args: any[]) => any;
  };
  asyncModel: AsyncModel;
}

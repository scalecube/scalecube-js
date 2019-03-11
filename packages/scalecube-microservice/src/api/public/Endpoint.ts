import AsyncModel from './AsyncModel';

export default interface Endpoint {
  uri?: string; // uri is the full path to the method <transport/serviceName/methodName>
  transport?: string; // ws://100.1.2.1 | window | webWorker | https://100.1.2.1 | http://100.1.2.1
  qualifier: string; // <serviceName/methodName>
  serviceName: string;
  methodName: string;
  asyncModel: AsyncModel;
  address: string;
}

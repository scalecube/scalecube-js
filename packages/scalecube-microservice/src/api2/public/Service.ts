import { AsyncModel } from '.';

export default interface Service {
  identifier: string;
  serviceDefinition: {
    serviceName: string;
    methodName: string;
    asyncModel: AsyncModel;
  };
  service: {
    [methodName: string]: (arg: any) => any;
  };
}

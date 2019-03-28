import { ServiceDefinition, AsyncModel } from '../api';
export declare const isValidServiceDefinition: (definition: ServiceDefinition) => boolean;
export declare const isValidServiceName: (serviceName: string) => boolean;
export declare const isValidMethods: (methods: {
  [methodName: string]: {
    asyncModel: AsyncModel;
  };
}) => boolean;
export declare const isValidMethod: ({
  methodData,
  methodName,
}: {
  methodData: {
    asyncModel: string;
  };
  methodName: string;
}) => boolean;
export declare const isValidAsyncModel: ({ asyncModel }: { asyncModel: AsyncModel }) => boolean;

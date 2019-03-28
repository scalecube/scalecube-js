import { AsyncModel, Message, RequestResponseAsyncModel, RequestStreamAsyncModel } from '../api';
export declare const MICROSERVICE_NOT_EXISTS = 'microservice does not exists';
export declare const MESSAGE_NOT_PROVIDED = 'Message has not been provided';
export declare const SERVICE_DEFINITION_NOT_PROVIDED = '(serviceDefinition) is not defined';
export declare const SERVICE_NAME_NOT_PROVIDED = '(serviceDefinition.serviceName) is not defined';
export declare const WRONG_DATA_FORMAT_IN_MESSAGE = 'Message format error: data must be Array';
export declare const getServiceIsNotValidError: (serviceName: string) => string;
export declare const getServiceMethodIsMissingError: (methodName: string) => string;
export declare const getNotFoundByRouterError: (qualifier: string) => string;
export declare const getAsyncModelMissmatch: (expectedAsyncModel: AsyncModel, receivedAsyncModel: AsyncModel) => string;
export declare const getMethodNotFoundError: (message: Message) => string;
export declare const getInvalidMethodReferenceError: (qualifier: string) => string;
export declare const ASYNC_MODEL_TYPES: {
  REQUEST_STREAM: RequestStreamAsyncModel;
  REQUEST_RESPONSE: RequestResponseAsyncModel;
};

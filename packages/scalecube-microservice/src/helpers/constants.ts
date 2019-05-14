import { AsyncModel, Message, RequestResponseAsyncModel, RequestStreamAsyncModel } from '../api';

export const MICROSERVICE_NOT_EXISTS = 'microservice does not exists';
export const MESSAGE_NOT_PROVIDED = 'Message has not been provided';
export const SERVICE_DEFINITION_NOT_PROVIDED = '(serviceDefinition) is not defined';
export const SERVICE_NAME_NOT_PROVIDED = '(serviceDefinition.serviceName) is not defined';
export const WRONG_DATA_FORMAT_IN_MESSAGE = 'Message format error: data must be Array';
export const DEFINITION_MISSING_METHODS = 'Definition missing methods:object';

export const getServiceIsNotValidError = (serviceName: string) => `service ${serviceName} is not valid.`;
export const getServiceMethodIsMissingError = (methodName: string) =>
  `service method '${methodName}' missing in the serviceDefinition`;
export const getNotFoundByRouterError = (qualifier: string) =>
  `can't find services with the request: '${JSON.stringify(qualifier)}'`;
export const getAsyncModelMissmatch = (expectedAsyncModel: AsyncModel, receivedAsyncModel: AsyncModel) =>
  `asyncModel miss match, expect ${expectedAsyncModel}, but received ${receivedAsyncModel}`;
export const getMethodNotFoundError = (message: Message) => `Can't find method ${message.qualifier}`;
export const getInvalidMethodReferenceError = (qualifier: string) => `Invalid method reference for ${qualifier}`;

export const getMethodsAreNotDefinedProperly = (serviceName: string, methods: string[]) =>
  `All of the following methods in ${serviceName} are not defined properly: ${methods.concat(', ')}`;
export const getServiceNameInvalid = (serviceName: any) =>
  `serviceName ${serviceName} is not valid, must be primitive type : string | number | null | undefined| symbol`;
export const ASYNC_MODEL_TYPES: {
  REQUEST_STREAM: RequestStreamAsyncModel;
  REQUEST_RESPONSE: RequestResponseAsyncModel;
} = {
  REQUEST_RESPONSE: 'requestResponse',
  REQUEST_STREAM: 'requestStream',
};

export const RSocketConnectionStatus = {
  NOT_CONNECTED: 'NOT_CONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  CLOSED: 'CLOSED',
  ERROR: 'ERROR',
};

export const MICROSERVICE_NOT_EXISTS = 'microservice does not exists';
export const MESSAGE_NOT_PROVIDED = 'Message has not been provided';
export const SERVICE_DEFINITION_NOT_PROVIDED = '(serviceDefinition) is not defined';
export const SERVICE_NAME_NOT_PROVIDED = '(serviceDefinition.serviceName) is not defined';
export const WRONG_DATA_FORMAT_IN_MESSAGE = 'Message format error: data must be Array';

export const getServiceIsNotValidError = (serviceName: string) => `service ${serviceName} is not valid.`;
export const getServiceMethodIsMissingError = (methodName: string) =>
  `service method '${methodName}' missing in the serviceDefinition`;
export const getNotFoundByRouterError = (qualifier: string) =>
  `can't find services with the request: '${JSON.stringify(qualifier)}'`;

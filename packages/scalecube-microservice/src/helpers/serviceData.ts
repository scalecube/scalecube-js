import { Message } from '../api/Message';

export const getServiceName = (service) => getServiceMeta(service).serviceName;

export const getMethodName = (service) => getServiceMeta(service).methodName;

export const getServiceMeta = (service) => service.constructor.meta || service.meta;

export const getServiceNamespace = (service) => `${getServiceName(service)}/${getMethodName(service)}`;

export const getServiceNamespaceFromMessage = (message: Message) => `${message.serviceName}/${message.methodName}`;

export const generateIdentifier = () => Date.now();

export const getServiceName = (service) => getServiceMeta(service).serviceName;

export const getServiceMeta = (service) => service.meta || service.constructor.meta;

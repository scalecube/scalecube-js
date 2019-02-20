import { Qualifier } from '../api2/private/types';

export const getServiceName = ({ qualifier }: { qualifier: string }) => qualifier.split('/')[0];

export const getMethodName = ({ qualifier }: { qualifier: string }) => qualifier.split('/')[1];

export const getQualifier = ({ serviceName, methodName }: Qualifier) => `${serviceName}/${methodName}`;

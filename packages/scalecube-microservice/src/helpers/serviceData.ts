import { Qualifier } from '../api/private/types';

export const getQualifier = ({ serviceName, methodName }: Qualifier) => `${serviceName}/${methodName}`;

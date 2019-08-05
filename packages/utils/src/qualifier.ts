import { MicroserviceApi } from '@scalecube/api';

export const getQualifier = ({ serviceName, methodName }: MicroserviceApi.Qualifier): string =>
  `${serviceName}/${methodName}`;

import { MicroserviceApi } from '@scalecube/api';

export const getQualifier = ({ serviceName, methodName }: { serviceName: string; methodName: string }): string =>
  `${serviceName}/${methodName}`;

export const getQualifier = ({ serviceName, methodName }: { serviceName: string; methodName: string }): string =>
  `${serviceName}/${methodName}`;

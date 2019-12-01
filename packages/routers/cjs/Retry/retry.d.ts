import { MicroserviceApi } from '@scalecube/api';
export declare const retryRouter: ({
  period,
  maxRetry,
}: {
  period: number;
  maxRetry?: number | undefined;
}) => (options: MicroserviceApi.RouterOptions) => Promise<MicroserviceApi.Endpoint>;

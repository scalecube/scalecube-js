import { MicroserviceApi } from '@scalecube/api';

export interface Proxy {
  [state: string]: any;
}

type singleProxyCreator = (url: string, definition: MicroserviceApi.ServiceDefinition) => Promise<Proxy>;
type multipleProxyCreator = (url: string, definitions: MicroserviceApi.ServiceDefinition[]) => Promise<Proxy[]>;
export type createGatewayProxyType = singleProxyCreator | multipleProxyCreator;

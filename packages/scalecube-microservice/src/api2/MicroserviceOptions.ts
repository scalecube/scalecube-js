import { PreRequest, Service, PostResponse } from './index';

export default interface MicroserviceOptions {
  services?: Service[];
  preRequest?: PreRequest;
  postResponse?: PostResponse;
}

import { Service } from '.';

export default interface MicroserviceOptions {
  services?: Service[];
  seedAddress?: string;
}

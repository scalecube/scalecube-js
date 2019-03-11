import { Endpoint } from "@scalecube/scalecube-microservice/src/api/public";

export default interface DiscoveryConnect {
  address: string;
  endPoints: Endpoint[];
  seedAddress: string,
}

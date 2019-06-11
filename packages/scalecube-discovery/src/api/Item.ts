import { Api as TransportAPI } from '@scalecube/transport';

export default interface Item {
  /**
   * @property
   * A unique address of the Discovery to which this Item belongs to.
   */
  address: TransportAPI.Address;
}

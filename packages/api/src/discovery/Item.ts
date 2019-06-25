import { Address } from '@scalecube/api';

export default interface Item {
  /**
   * @property
   * A unique address of the Discovery to which this Item belongs to.
   */
  address: Address;
}

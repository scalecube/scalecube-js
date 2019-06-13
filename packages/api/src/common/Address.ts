/**
 * @interface Address
 * URI address
 */
export default interface Address {
  /**
   * @property
   * unique identifier that allows other computers to access it.
   */
  host: string;
  /**
   * @property
   * determine on which port number the server will receive the data
   */
  port: number;
  /**
   * @property
   * rules for communication between server and client
   * ws | pm | tcp
   */
  protocol: string;
  /**
   * @property
   * relative address
   */
  path: string;
  /**
   * @property
   * address is <protocol>://<host>:<port>/<path>
   */
  fullAddress: string;
}

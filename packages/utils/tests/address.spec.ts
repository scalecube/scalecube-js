import { getAddress, getFullAddress, validateAddress } from '../src';
import {
  NOT_VALID_ADDRESS,
  NOT_VALID_HOST,
  NOT_VALID_PATH,
  NOT_VALID_PORT,
  NOT_VALID_PROTOCOL,
} from '../src/constants';

describe('Test address', () => {
  test(`
    Given undefined as address
    And isOptional flag = true
    When validateAddress
    Then check will pass
  `, () => {
    expect.assertions(1);

    const isValid = validateAddress(undefined, true);
    expect(isValid).toBeTruthy();
  });

  test(`
    Given undefined as address
    And isOptional flag = false
    When validateAddress
    Then check will fail
  `, () => {
    expect.assertions(1);

    try {
      validateAddress(undefined, false);
    } catch (e) {
      expect(e.message).toMatch(NOT_VALID_ADDRESS);
    }
  });

  const buildAddress = ({ host = 'defaultHost', path = 'defaultPath', port = 8080, protocol = 'pm' }) => ({
    host,
    path,
    port,
    protocol,
  });

  test.each([{}, [], null, 80, true])(
    `
    Given invalid host
    | type    | value |
    | object  | {}    |
    | array   | []    |
    | null    | null  |
    | number  | 80    |
    | boolean | true  |
    When  using the host in the address
    And   validate the address
    Then  exception will occur`,
    (host) => {
      expect.assertions(1);

      try {
        validateAddress(buildAddress({ host }));
      } catch (e) {
        expect(e.message).toMatch(NOT_VALID_HOST);
      }
    }
  );

  test.each([{}, [], null, 80, true])(
    `
    Given invalid path
    | type    | value |
    | object  | {}    |
    | array   | []    |
    | null    | null  |
    | number  | 80    |
    | boolean | true  |
    When  using the path in the address
    And   validate the address
    Then  exception will occur`,
    (path) => {
      expect.assertions(1);

      try {
        validateAddress(buildAddress({ path }));
      } catch (e) {
        expect(e.message).toMatch(NOT_VALID_PATH);
      }
    }
  );

  test.each([{}, [], null, 'sd', true])(
    `
    Given invalid port
    | type    | value |
    | object  | {}    |
    | array   | []    |
    | null    | null  |
    | string  | 'sd'  |
    | boolean | true  |
    When  using the port in the address 
    And   validate the address
    Then  exception will occur`,
    (port) => {
      expect.assertions(1);

      try {
        validateAddress(buildAddress({ port }));
      } catch (e) {
        expect(e.message).toMatch(NOT_VALID_PORT);
      }
    }
  );

  test.each([{}, [], null, 80, true, 'not valid'])(
    `
    Given invalid protocol
    | type             | value       |
    | object           | {}          |
    | array            | []          |
    | null             | null        |
    | number           | 80          |
    | boolean          | true        |
    | not valid string | 'not valid' |
    When  using the protocol in the address
    And   validate the address
    Then  exception will occur`,
    (protocol) => {
      expect.assertions(1);

      try {
        validateAddress(buildAddress({ protocol }));
      } catch (e) {
        expect(e.message).toMatch(NOT_VALID_PROTOCOL);
      }
    }
  );

  test(`
    Given valid address
    When calling getFullAddress(address)
    Then fullAddress will be received
    [protocol]://[hos]t:[port]/[path]
  `, () => {
    expect.assertions(1);

    const address = buildAddress({});
    const fullAddress = getFullAddress(address);
    expect(fullAddress).toMatch(`${address.protocol}://${address.host}:${address.port}/${address.path}`);
  });

  test(`
    Given invalid address
    When calling getFullAddress(address)
    Then exception will be occur
  `, () => {
    expect.assertions(1);

    try {
      // @ts-ignore
      getFullAddress();
    } catch (e) {
      expect(e.message).toMatch(NOT_VALID_ADDRESS);
    }
  });

  test(`
  Given a string
  When calling getAddress with the given string
  Then result will be of type Address
  `, () => {
    const address = getAddress('randomPath');
    expect(address).toMatchObject(
      expect.objectContaining({
        protocol: expect.any(String),
        path: expect.any(String),
        host: expect.any(String),
        port: expect.any(Number),
      })
    );
  });
  test(`
  Given a string 'ws://localhost:1234'
  When calling getAddress with the given string
  Then result will matching address object
  `, () => {
    const address = getAddress('ws://localhost:1234/');
    expect(address).toMatchObject(
      expect.objectContaining({
        protocol: 'ws',
        path: '',
        host: 'localhost',
        port: 1234,
      })
    );
  });
});

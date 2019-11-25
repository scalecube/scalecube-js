import { createDiscovery } from '../../mockDiscovery';
import { constants, getAddress } from '@scalecube/utils';
import { INVALID_ITEMS_TO_PUBLISH } from '../../../src/helpers/constants';

describe('check validations', () => {
  // @ts-ignore
  test.each([[], {}, '', false, true, 10, null, undefined, Symbol()])(
    `
  Scenario: Create discovery with invalid address
   Given an address with the following value

   type	        | value
   -------------|------
   array	      | []
   empty object | {}
   string	      | ''
   boolean	    | false
   boolean	    | true
   number	      | 10
   null	        | null
   undefined	  | undefined
   symbol	      | Symbol()

   When create discovery with this address
   Then an exception will be thrown
  `,
    (value, done) => {
      try {
        createDiscovery({
          address: value,
          itemsToPublish: [],
        });
      } catch (e) {
        expect(e.message).toMatch(constants.NOT_VALID_ADDRESS);
        done();
      }
    }
  );

  // @ts-ignore
  test.each([[], {}, true, 10, 'test', Symbol()])(
    `
  Scenario: Create discovery with invalid seedAddress
   Given a seedAddress with the following value

   type	        | value
   -------------|------
   array	      | []
   empty object | {}
   boolean	    | true
   number	      | 10
   string       | 'test'
   symbol	      | Symbol()

   # must check seedAddress validation for every value that result as true.

   When create discovery with this address
   Then an exception will be thrown
  `,
    (value, done) => {
      try {
        createDiscovery({
          address: getAddress('AA'),
          seedAddress: value,
          itemsToPublish: [],
        });
      } catch (e) {
        expect(e.message).toMatch(constants.NOT_VALID_ADDRESS);
        done();
      }
    }
  );

  // @ts-ignore
  test.each([{}, true, false, 10, null, undefined, 'test', Symbol()])(
    `
  Scenario: Create discovery with invalid itemsToPublish
    Given  itemsToPublish with following value

   type	        | value
   -------------|------
   empty object | {}
   boolean	    | true
   boolean	    | false
   number	      | 10
   null	        | null
   undefined	  | undefined
   string       | 'test'
   symbol	      | Symbol()

   # must check seedAddress validation for every value that result as true.

   When create discovery with this itemsToPublish
   Then an exception is thrown
  `,
    (value, done) => {
      try {
        createDiscovery({
          address: getAddress('AA'),
          itemsToPublish: value,
        });
      } catch (e) {
        expect(e.message).toMatch(INVALID_ITEMS_TO_PUBLISH);
        done();
      }
    }
  );
});

/*****
 * This file contains scenarios for failed attempts when using serviceCall method.
 * 1. Included validation tests for serviceCall.
 * 2. Related issue in GitHub
 *    Check validation - serviceCall without message - https://github.com/scalecube/scalecube-js/issues/109
 *    Check validation - serviceCall message data is not an array - https://github.com/scalecube/scalecube-js/issues/110
 *    Check validation - serviceCall qualifier is not type string - https://github.com/scalecube/scalecube-js/issues/111
 *****/
import { Microservices } from '../../../src';
import {
  MESSAGE_NOT_PROVIDED,
  MESSAGE_DATA_NOT_PROVIDED,
  MESSAGE_QUALIFIER_NOT_PROVIDED,
  INVALID_MESSAGE,
  QUALIFIER_IS_NOT_STRING,
  WRONG_DATA_FORMAT_IN_MESSAGE,
} from '../../../src/helpers/constants';

describe('validation test for create proxy from microservice', () => {
  const ms = Microservices.create({});
  const serviceCall = ms.createServiceCall({});

  test(`
      Given     a serviceCall instance
      When      invoking a requestResponse without message
      Then      the requestResponse will reject with error message
    `, (done) => {
    expect.assertions(2);
    // @ts-ignore
    expect(serviceCall.requestResponse()).rejects.toMatchObject(new Error(MESSAGE_NOT_PROVIDED));
    // @ts-ignore
    serviceCall.requestStream().subscribe(
      () => {},
      (error: Error) => {
        expect(error.message).toMatch(MESSAGE_NOT_PROVIDED);
        done();
      }
    );
  });

  // @ts-ignore
  describe.each([[], 'test', 10, null, Symbol(), true, false])(
    `
      Scenario: serviceCall invalid message
      Given     invalid message
                | type      | value     |
                | array     | []        |
                | string    | 'test'    |
                | number    | 10        |
                | null      | null      |
                | symbol    | Symbol()  |
                | boolean   | true      |
                | boolean   | false     |
      `,
    (message) => {
      test(`
      Given     a serviceCall instance
      And       message invalid format
      When      invoking a requestResponse with invalid message
      Then      the requestResponse will reject with error message
    `, () => {
        expect.assertions(1);
        // @ts-ignore
        return expect(serviceCall.requestResponse(message)).rejects.toMatchObject(new Error(INVALID_MESSAGE));
      });

      test(`
      Given     a serviceCall instance
      And       message invalid format
      When      subscribe to requestStream with invalid message
      Then      the requestStream will reject with error message
    `, (done) => {
        expect.assertions(1);
        // @ts-ignore
        serviceCall.requestStream(message).subscribe(
          () => {},
          (error: Error) => {
            expect(error.message).toMatch(INVALID_MESSAGE);
            done();
          }
        );
      });
    }
  );

  test(`
      Given     a serviceCall instance
      When      invoking a requestResponse with message without data
      Then      the requestResponse will reject with error message
    `, (done) => {
    expect.assertions(2);
    const message = { qualifier: 'service/method' };
    // @ts-ignore
    expect(serviceCall.requestResponse(message)).rejects.toMatchObject(new Error(MESSAGE_DATA_NOT_PROVIDED));
    // @ts-ignore
    serviceCall.requestStream(message).subscribe(
      () => {},
      (error: Error) => {
        expect(error.message).toMatch(MESSAGE_DATA_NOT_PROVIDED);
        done();
      }
    );
  });
  // @ts-ignore
  describe.each(['test', '', 10, {}, null, Symbol(), true, false])(
    `
      Scenario: serviceCall invalid message - data is not array
      Given     invalid message
                | type      | value     |
                | string    | 'test'    |
                | string    | ''        |
                | number    | 10        |
                | null      | null      |
                | object    | {}        |
                | undefined | undefined |
                | symbol    | Symbol()  |
                | boolean   | true      |
                | boolean   | false     |
      `,
    (data) => {
      const message = {
        qualifier: 'service/method',
        data,
      };

      test(`
      Given     a serviceCall instance
      And       message with invalid data format
      When      invoking a requestResponse with invalid message
      Then      the requestResponse will reject with error message
    `, () => {
        expect.assertions(1);
        // @ts-ignore
        return expect(serviceCall.requestResponse(message)).rejects.toMatchObject(
          new Error(WRONG_DATA_FORMAT_IN_MESSAGE)
        );
      });

      test(`
      Given     a serviceCall instance
      And       message with invalid data format
      When      subscribe to requestStream with invalid message
      Then      the requestStream will reject with error message
    `, (done) => {
        expect.assertions(1);
        // @ts-ignore
        serviceCall.requestStream(message).subscribe(
          () => {},
          (error: Error) => {
            expect(error.message).toMatch(WRONG_DATA_FORMAT_IN_MESSAGE);
            done();
          }
        );
      });
    }
  );

  test(`
      Given     a serviceCall instance
      When      invoking a requestResponse with message without qualifier
      Then      the requestResponse will reject with error message
    `, (done) => {
    expect.assertions(2);
    const message = { data: [] };
    // @ts-ignore
    expect(serviceCall.requestResponse(message)).rejects.toMatchObject(new Error(MESSAGE_QUALIFIER_NOT_PROVIDED));
    // @ts-ignore
    serviceCall.requestStream(message).subscribe(
      () => {},
      (error: Error) => {
        expect(error.message).toMatch(MESSAGE_QUALIFIER_NOT_PROVIDED);
        done();
      }
    );
  });
  // @ts-ignore
  describe.each(['', [], 10, {}, null, Symbol(), true, false])(
    `
      Scenario: serviceCall invalid message - qualifier is not string
      Given     invalid message 
                | type         | value     |
                | empty string | ''        |
                | array        | []        |
                | number       | 10        |
                | null         | null      |
                | object       | {}        |
                | undefined    | undefined |
                | symbol       | Symbol()  |
                | boolean      | true      |
                | boolean      | false     |
      `,
    (qualifier) => {
      const message = {
        qualifier,
        data: [],
      };

      test(`
      Given     a serviceCall instance
      And       message with invalid qualifier format
      When      invoking a requestResponse with invalid message
      Then      the requestResponse will reject with error message
    `, () => {
        expect.assertions(1);
        // @ts-ignore
        return expect(serviceCall.requestResponse(message)).rejects.toMatchObject(new Error(QUALIFIER_IS_NOT_STRING));
      });

      test(`
      Given     a serviceCall instance
      And       message with invalid qualifier format
      When      subscribe to requestStream with invalid message
      Then      the requestStream will reject with error message
    `, (done) => {
        expect.assertions(1);
        // @ts-ignore
        serviceCall.requestStream(message).subscribe(
          () => {},
          (error: Error) => {
            expect(error.message).toMatch(QUALIFIER_IS_NOT_STRING);
            done();
          }
        );
      });
    }
  );
});

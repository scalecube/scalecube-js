import { createMS, ASYNC_MODEL_TYPES } from '../../mocks/microserviceFactory';
import { getInvalidMethodReferenceError, getInvalidServiceReferenceError } from '../../../src/helpers/constants';
import { getQualifier } from '@scalecube/utils';

describe('test injectProxy logic', () => {
  const definitionA = {
    serviceName: 'serviceA',
    methods: {
      getDefaultName: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
  };

  const definitionB = {
    serviceName: 'serviceB',
    methods: {
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
  };

  const defaultName = 'defaultName';

  test.each(['', 1, false, [], () => {}])(
    `Scenario: reference callback return invalid value
  Given     serviceB with a reference in function format and return value of
            
            |type      |value   |
            | --       | --     |
            | string   | ''     |
            | number   | 1      |
            | boolean  | false  |
            | array    | []     |
            | function | ()=>{} |

  And       serviceA with a reference in object format and method getDefaultName
  When    creating a microservice with both services
  Then     exception will occur.`,
    (value, done) => {
      expect.assertions(1);

      try {
        createMS({
          services: [
            {
              reference: {
                // @ts-ignore
                getDefaultName: () => Promise.resolve(defaultName),
              },
              definition: definitionA,
            },
            {
              reference: ({ createProxy, createServiceCall }) => {
                return value;
              },
              definition: definitionB,
            },
          ],
        });
      } catch (e) {
        expect(e.message).toMatch(getInvalidServiceReferenceError(definitionB.serviceName));
        done();
      }
    }
  );

  test(`
    Scenario:   reference callback return methods
    But         not methods that are included in the definition
    Given       serviceB with a reference in function format and return object format and method bye
    And         serviceB definition with hello method
    And         serviceA with a reference in object format and method getDefaultName
    And         serviceA definition with getDefaultName method
    When        creating a microservice with both services
    Then        exception will occur.`, (done) => {
    expect.assertions(1);

    try {
      createMS({
        services: [
          {
            reference: {
              // @ts-ignore
              getDefaultName: () => Promise.resolve(defaultName),
            },
            definition: definitionA,
          },
          {
            reference: ({ createProxy, createServiceCall }) => {
              return {
                someMethod: () => {},
              };
            },
            definition: definitionB,
          },
        ],
      });
    } catch (e) {
      expect(e.message).toMatch(
        getInvalidMethodReferenceError(
          getQualifier({
            serviceName: definitionB.serviceName,
            methodName: 'hello',
          })
        )
      );
      done();
    }
  });
});

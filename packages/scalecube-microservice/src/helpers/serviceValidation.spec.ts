import { isValidServiceDefinition, isValidServiceName, isValidMethods, isValidMethod } from './serviceValidation';
import { greetingServiceDefinition } from '../../tests/mocks/GreetingService';
import { ASYNC_MODEL_TYPES } from './constants';

describe('Unit testing serviceValidations', () => {
  console.error = jest.fn(); // disable validation logs while doing this test

  it('Test isValidMethods(methods) - invalid methods - invoke with invalid value type', () => {
    // @ts-ignore
    expect(isValidMethods('').isValid).toBe(false);
    // @ts-ignore
    expect(isValidMethods(true).isValid).toBe(false);
    // @ts-ignore
    expect(isValidMethods(1).isValid).toBe(false);
    // @ts-ignore
    expect(isValidMethods([]).isValid).toBe(false);
    // @ts-ignore
    expect(isValidMethods(null).isValid).toBe(false);
    // @ts-ignore
    expect(isValidMethods(undefined).isValid).toBe(false);
  });

  it('Test isValidMethods(methods) - valid methods', () => {
    expect(
      isValidMethods(
        {
          hello: {
            asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
          },
        },
        'greet'
      ).isValid
    ).toBe(true);
  });

  it('Test isValidMethod({methodData, methodName}) - invalid - no methodProp.type', () => {
    // @ts-ignore
    expect(isValidMethod({ methodData: {}, methodName: 'testMethod' })).toBe(false);
  });

  it('Test isValidMethod({methodData, methodName}) - invalid - methodProp.type !== Promise | Observable', () => {
    expect(isValidMethod({ methodData: { asyncModel: 'something' } })).toBe(false);
  });

  it('Test isValidMethod({methodData, methodName}) - valid - methodProp.type === Promise | Observable', () => {
    expect(isValidMethod({ methodData: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE } })).toBe(true);
  });

  it('Test isValidMethod({methodProp, methodName}) - valid - methodProp.type === Promise | Observable', () => {
    expect(isValidMethod({ methodData: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM } })).toBe(true);
  });

  it('Test isValidServiceName(serviceName) - invalid value type', () => {
    // @ts-ignore
    expect(isValidServiceName(1).isValid).toBe(false);
    // @ts-ignore
    expect(isValidServiceName(true).isValid).toBe(false);
    // @ts-ignore
    expect(isValidServiceName({}).isValid).toBe(false);
    // @ts-ignore
    expect(isValidServiceName([]).isValid).toBe(false);
    // @ts-ignore
    expect(isValidServiceName(null).isValid).toBe(false);
    // @ts-ignore
    expect(isValidServiceName(undefined).isValid).toBe(false);
  });

  it('Test isValidServiceName(serviceName) - valid value type ', () => {
    expect(isValidServiceName('serviceName').isValid).toBe(true);
  });

  it('Test isValidService(service) - invalid - no meta data', () => {
    // @ts-ignore
    expect(isValidServiceDefinition({}).isValid).toBe(false);
  });

  it('Test isValidService(service) - valid - meta data', () => {
    expect(isValidServiceDefinition(greetingServiceDefinition).isValid).toBe(true);
  });
});

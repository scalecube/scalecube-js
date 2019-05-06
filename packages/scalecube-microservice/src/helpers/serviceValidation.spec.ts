import { isValidServiceDefinition, isValidServiceName, isValidMethods, isValidMethod } from './serviceValidation';
import { greetingServiceDefinition } from '../../tests/mocks/GreetingService';
import { ASYNC_MODEL_TYPES } from './constants';

describe('Unit testing serviceValidations', () => {
  console.error = jest.fn(); // disable validation logs while doing this test

  it('Test isValidMethods(methods) - invalid methods - invoke with invalid value type', () => {
    // @ts-ignore
    expect(isValidMethods('')).toBe(false);
    // @ts-ignore
    expect(isValidMethods(true)).toBe(false);
    // @ts-ignore
    expect(isValidMethods(1)).toBe(false);
    // @ts-ignore
    expect(isValidMethods([])).toBe(false);
    // @ts-ignore
    expect(isValidMethods(null)).toBe(false);
    // @ts-ignore
    expect(isValidMethods(undefined)).toBe(false);
  });

  it('Test isValidMethods(methods) - valid methods', () => {
    expect(
      isValidMethods({
        hello: {
          asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
        },
      })
    ).toBe(true);
  });

  it('Test isValidMethod({methodData, methodName}) - invalid - no methodProp.type', () => {
    // @ts-ignore
    expect(isValidMethod({ methodData: {}, methodName: 'testMethod' })).toBe(false);
  });

  it('Test isValidMethod({methodData, methodName}) - invalid - methodProp.type !== Promise | Observable', () => {
    expect(isValidMethod({ methodData: { asyncModel: 'something' }, methodName: 'testMethod' })).toBe(false);
  });

  it('Test isValidMethod({methodData, methodName}) - valid - methodProp.type === Promise | Observable', () => {
    expect(
      isValidMethod({ methodData: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE }, methodName: 'testMethod' })
    ).toBe(true);
  });

  it('Test isValidMethod({methodProp, methodName}) - valid - methodProp.type === Promise | Observable', () => {
    expect(
      isValidMethod({ methodData: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM }, methodName: 'testMethod' })
    ).toBe(true);
  });

  it('Test isValidServiceName(serviceName) - invalid value type', () => {
    // @ts-ignore
    expect(isValidServiceName(1)).toBe(false);
    // @ts-ignore
    expect(isValidServiceName(true)).toBe(false);
    // @ts-ignore
    expect(isValidServiceName({})).toBe(false);
    // @ts-ignore
    expect(isValidServiceName([])).toBe(false);
    // @ts-ignore
    expect(isValidServiceName(null)).toBe(false);
    // @ts-ignore
    expect(isValidServiceName(undefined)).toBe(false);
  });

  it('Test isValidServiceName(serviceName) - valid value type ', () => {
    expect(isValidServiceName('serviceName')).toBe(true);
  });

  it('Test isValidService(service) - invalid - no meta data', () => {
    // @ts-ignore
    expect(isValidServiceDefinition({})).toBe(false);
  });

  it('Test isValidService(service) - valid - meta data', () => {
    expect(isValidServiceDefinition(greetingServiceDefinition)).toBe(true);
  });
});

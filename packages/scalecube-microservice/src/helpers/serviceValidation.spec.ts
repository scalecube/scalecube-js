import { isValidRawService, isValidServiceName, isValidMethods, isValidMethod } from './serviceValidation';

describe('Unit testing serviceValidations', () => {
  console.error = jest.fn(); // disable validation logs while doing this test

  it('Test isValidMethods(methods) - invalid methods - invoke with invalid value type', () => {
    expect(isValidMethods('')).toBe(false);
    expect(isValidMethods(true)).toBe(false);
    expect(isValidMethods(1)).toBe(false);
    expect(isValidMethods([])).toBe(false);
    expect(isValidMethods(null)).toBe(false);
    expect(isValidMethods(undefined)).toBe(false);
  });

  it('Test isValidMethods(methods) - valid methods', () => {
    expect(
      isValidMethods({
        hello: {
          asyncModel: 'Promise',
        },
      })
    ).toBe(true);
  });

  it('Test isValidMethod({methodProp, method}) - invalid - no methodProp.type', () => {
    expect(isValidMethod({ methodProp: {}, method: 'testMethod' })).toBe(false);
  });

  it('Test isValidMethod({methodProp, method}) - invalid - methodProp.type !== Promise | Observable', () => {
    expect(isValidMethod({ methodProp: { asyncModel: 'something' }, method: 'testMethod' })).toBe(false);
  });

  it('Test isValidMethod({methodProp, method}) - valid - methodProp.type === Promise | Observable', () => {
    expect(isValidMethod({ methodProp: { asyncModel: 'Promise' }, method: 'testMethod' })).toBe(true);
  });

  it('Test isValidMethod({methodProp, method}) - valid - methodProp.type === Promise | Observable', () => {
    expect(isValidMethod({ methodProp: { asyncModel: 'Observable' }, method: 'testMethod' })).toBe(true);
  });

  it('Test isValidServiceName(serviceName) - invalid value type', () => {
    expect(isValidServiceName(1)).toBe(false);
    expect(isValidServiceName(true)).toBe(false);
    expect(isValidServiceName({})).toBe(false);
    expect(isValidServiceName([])).toBe(false);
    expect(isValidServiceName(null)).toBe(false);
    expect(isValidServiceName(undefined)).toBe(false);
  });

  it('Test isValidServiceName(serviceName) - valid value type ', () => {
    expect(isValidServiceName('serviceName')).toBe(true);
  });

  it('Test isValidService(service) - invalid - no meta data', () => {
    expect(isValidRawService({})).toBe(false);
  });

  it('Test isValidService(service) - valid - meta data', () => {
    expect(
      isValidRawService({
        meta: {
          serviceName: 'serviceName',
          methods: { hello: { asyncModel: 'Promise' } },
        },
      })
    ).toBe(true);
  });
});

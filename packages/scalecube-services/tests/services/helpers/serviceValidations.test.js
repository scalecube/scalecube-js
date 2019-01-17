import {
  isValidMethods,
  isValidMethod,
  isValidService,
  isContainServiceName,
} from '../../../src/services/helpers/serviceValidations';

describe('Unit testing serviceValidations', () => {
  console.error = jest.fn(); // disable validation logs while doing this test

  it('Test isValidMethods(methods) - invalid methods - invoke without value', () => {
    expect(isValidMethods()).toBe(false);
  });

  it('Test isValidMethods(methods) - invalid methods - invoke with invalid value type', () => {
    expect(isValidMethods('')).toBe(false);
    expect(isValidMethods(true)).toBe(false);
    expect(isValidMethods(1)).toBe(false);
    expect(isValidMethods([])).toBe(false);
    expect(isValidMethods(null)).toBe(false);
    expect(isValidMethods(undefined)).toBe(false);
  });

  it('Test isValidMethods(methods) - valid methods', () => {
    expect(isValidMethods({
      hello: {
        type: 'Promise'
      }
    })).toBe(true);
  });

  it('Test isValidMethod({methodProp, method}) - invalid - no methodProp.type', () => {
    expect(isValidMethod({ methodProp: {}, method: 'testMethod' })).toBe(false);
  });

  it('Test isValidMethod({methodProp, method}) - invalid - methodProp.type !== Promise | Observable', () => {
    expect(isValidMethod({ methodProp: { type: 'something' }, method: 'testMethod' })).toBe(false);
  });

  it('Test isValidMethod({methodProp, method}) - valid - methodProp.type === Promise | Observable', () => {
    expect(isValidMethod({ methodProp: { type: 'Promise' }, method: 'testMethod' })).toBe(true);
  });

  it('Test isValidMethod({methodProp, method}) - valid - methodProp.type === Promise | Observable', () => {
    expect(isValidMethod({ methodProp: { type: 'Observable' }, method: 'testMethod' })).toBe(true);
  });

  it('Test isContainServiceName(serviceName) - invalid value type', () => {
    expect(isContainServiceName(1)).toBe(false);
    expect(isContainServiceName(true)).toBe(false);
    expect(isContainServiceName({})).toBe(false);
    expect(isContainServiceName([])).toBe(false);
    expect(isContainServiceName(null)).toBe(false);
    expect(isContainServiceName(undefined)).toBe(false);
  });

  it('Test isContainServiceName(serviceName) - valid value type ', () => {
    expect(isContainServiceName('serviceName')).toBe(true);
  });

  it('Test isValidService(service) - invalid - no meta data', () => {
    expect(isValidService({})).toBe(false);
  });

  it('Test isValidService(service) - valid - meta data', () => {
    expect(isValidService({
      meta: {
        serviceName: 'serviceName',
        methods: { hello: { type: 'Promise' } }
      }
    })).toBe(true);
  });
});

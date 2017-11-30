// @flow


export default class ServiceB {
  hello() {
    return "Hello" + serviceA.getUser();
  }
}

ServiceB.isService = true;
ServiceB.meta = {
  type: 'class'
}
ServiceB.prototype.hello.isService = true;
ServiceB.prototype.hello.meta = {
  type: 'promise'
};
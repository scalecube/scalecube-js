// @flow

export class ServiceCall{
  router;
  constructor(router){
    this.router = router;
  }
  invoke(message) {
    const inst = this.router.route(message).service;
    return inst[message.method](...message.data);
  }
}
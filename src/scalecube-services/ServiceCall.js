// @flow

export class ServiceCall{
  router;
  constructor(router){
    this.router = router;
  }
  invoke(message) {
    const inst = this.router.route(message);
    return inst.service[message.method](...message.data);
  }
}
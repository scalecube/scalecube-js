// @flow

interface api {
  static meta: any;
}
class GreetingService implements api {
  static meta: any;
  hello(name: string) {
    return `Hello ${name}`;
  }
}
Object.defineProperty(GreetingService, 'meta', {
  value: {
    type: 'class',
    methods: {
      hello: {
        type: 'sync'
      }
    }
  }
});


export default GreetingService;
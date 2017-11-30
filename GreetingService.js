// @flow


class GreetingService {
  hello(name) {
    return `Hello ${name}`;
  }
}
GreetingService.meta = {
  type: 'class',
  methods: {
    hello: {
      type: 'sync'
    }
  }
}
;


export default GreetingService;
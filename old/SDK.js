// @flow

function* services(resolve) {
  let registeredServices = [];
  let futures = [];
  while (true){
    const next = yield;
    if( Array.isArray(next) ) {
      // this will be a big thing... not this naive impl
      next.map((s)=>registeredServices[s.constructor.name]=s);
    } else {
      futures.push(next);
    }
    futures = futures.filter((i)=>i(registeredServices))
  }
}
const servicesSequence = services();

export const register = (services) => {
    servicesSequence.next(services);
}
export const service = (service) => {
    return new Promise((resolve) => {
      servicesSequence.next((registeredServices)=>{
        if( registeredServices[service] ) {
          resolve(registeredServices[service]); // fulfilled
          return false;
        }
        return true;
      });
    });
  }
}

export class microservice{
  // class or module
  static builder(module){

  }
}
export class messaging{

}

export class dispatcher {
  invoke(messege);
  listen(messege)
}

sayhello(hello) {
  msg = messegeCreate(hello);
  dispatcher.invoke(msg);
}
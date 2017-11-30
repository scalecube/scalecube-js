// @flow

interface Observable {
  constructor(subscriber: SubscriberFunction): void;

  // Subscribes to the sequence with an observer
  subscribe(observer: Observer): Subscription;

  // Subscribes to the sequence with callbacks
  subscribe(  onNext: Function,
              onError: ?Function,
              onComplete: ?Function) : Subscription;

  // Returns itself
  Symbol: { observable(): Observable };

  // Converts items to an Observable
  static of(...items): Observable;

  // Converts an observable or iterable to an Observable
  static from(observable): Observable;

}

interface Subscription {

  // Cancels the subscription
  unsubscribe(): void;

  // A boolean value indicating whether the subscription is closed
  closed(): Boolean;
}

declare function SubscriberFunction(observer: SubscriptionObserver): (()=>void)|Subscription;

interface Observer {

  // Receives the subscription object when `subscribe` is called
  start(subscription: Subscription): any;

  // Receives the next value in the sequence
  next(value): any;

  // Receives the sequence error
  error(errorValue): any;

  // Receives a completion notification
  complete(): any;
}

interface SubscriptionObserver {

  // Sends the next value in the sequence
  next(value): any;

  // Sends the sequence error
  error(errorValue): any;

  // Sends the completion notification
  complete(): any;

  // A boolean value indicating whether the subscription is closed
  closed(): Boolean;
}
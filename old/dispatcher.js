// @flow

interface dispatcher {
  invoke (message: Message): Future<Message>;
  listen (message: Message): Subscriber<Message>;
}
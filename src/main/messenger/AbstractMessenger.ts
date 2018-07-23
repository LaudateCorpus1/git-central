import { EventEmitter } from 'electron';

type MessengerEvent<T> = {
  [P in keyof T]: {
    param: any;
    returns: any;
  }
};

/**
 * Base class for Node Messengers.
 */
abstract class AbstractMessenger {
  protected messenger: EventEmitter;

  constructor(messenger: EventEmitter) {
    this.messenger = messenger;
    this.messenger.on('message', (event: any) => {
      this.handleRawData(event);
    });
  }

  /**
   * This method is meant to be overridden by derived NodeMessengers. This is a callback that gets
   * triggered when a message is received.
   * @param event
   */
  protected abstract handleRawData(event: any): void;
}

export {
  MessengerEvent,
  AbstractMessenger,
};

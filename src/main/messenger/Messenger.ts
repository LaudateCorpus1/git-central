import {
  MessengerEvent,
  AbstractMessenger,
} from './AbstractMessenger';
import { EventEmitter } from "electron";

/**
 * Calling a method can result in failures. When this is the case we provide an `IMessengerError`.
 */
interface IMessengerError {
  message: string;
  stack: string[];
}

/**
 * The information necessary to identify an event.
 */
interface IMessengerEventInfo {
  type: string;
  target: any;
}

/**
 * Data passed in every node message.
 */
interface IMessengerMessageEventData<T> {
  type: T;
  data: any;
  callNumber: number;
  resolved: boolean;
  action: 'execute' | 'callback';
}

interface IMessengerOutput<T> {
  resolved: boolean;
  data: T;
}

// type ImplementMe<T extends MessengerEvent<T>> = {
//   [P in Extract<keyof T, string>]: (param: T[P]['param']) => T[P]['returns'];
// };

// interface Messenger<
//   D extends MessengerEvent<D>,
//   C extends MessengerEvent<C>
// >  ImplementMe<D> {
//
// }

abstract class Messenger<
  D extends MessengerEvent<D>,
  C extends MessengerEvent<C>
  > extends AbstractMessenger {
  static _callNumber = 0;
  protected _methods?: { [key: string]: any };
  protected _callbacks?: { [key: string]: any };

  constructor(messenger: EventEmitter) {
    super(messenger);
  }

  /**
   * Define one of the methods declared by the generic `D`. For instance, if we have
   *
   * ```ts
   * interface DefinedMethods {
   *   getVersion: any;
   * }
   *
   * interface DefinedMethodsInput {
   *   getVersion: {};
   * }
   *
   * interface DefinedMethodsOutput {
   *   getVersion: { version: number };
   * }
   *
   * const server = new Messenger<DefinedMethods, DefinedMethodsInput, DefinedMethodsOuput, ...>;
   * ...
   * server.on('getVersion', (_: {}) => {
   *  return 0;
   * });
   * ```
   *
   * WARNING: define the methods in the `init` paramter passed to the constructor. Otherwise the
   * other Messenger may start calling the methods which are not yet defined.
   */
  on<N extends keyof D>(
    type: N,
    fn: (
      args: D[N]['param'],
      eventInfo: IMessengerEventInfo,
    ) => D[N]['returns'] | Promise<D[N]['returns']>,
  ): void {
    const methods: any = this._methods = this._methods || {};
    if (methods[type]) {
      throw Error(`method '${type}' is already defined in the Messenger object`);
    }
    methods[type] = fn;
  }

  /**
   * Remove the definition for the given method.
   * @param type
   */
  off<N extends keyof D>(type: N): void {
    const methods: any = this._methods;
    if (!methods) {
      return;
    }
    delete methods[type];
  }

  /**
   * Call a method defined in the other Messenger.
   * @param type The type of the method to call.
   * @param input The input to provide to the method.
   */
  fire<N extends keyof C>(type: N, input: C[N]['param']): Promise<C[N]['returns']> {
    Messenger._callNumber += 1;
    const callNumber = Messenger._callNumber;
    const callbacks: any = this._callbacks = this._callbacks || {};
    return new Promise((resolve, reject) => {
      callbacks[`${type}$${callNumber}`] = { resolve, reject };
      this.send({
        callNumber,
        type: type as any,
        data: input,
        resolved: true,
        action: 'execute',
      });
    });
  }

  /**
   * Helper method for `handleRawData`. Detaches the logic of executing a method and returning
   * its output or error.
   */
  private executeMethod<N extends keyof D>(
    type: N, data: D[N]['param'],
  ): IMessengerOutput<D[N]['returns'] | IMessengerError> {
    try {
      const methods: any = this._methods;
      const eventInfo: any = { method: type, target: this };
      return {
        resolved: true,
        data: methods[type].call(this, data, eventInfo),
      };
    } catch (ex) {
      return {
        resolved: false,
        data: {
          message: ex.message,
          stack: ex.stack.split('\n'),
        },
      };
    }
  }

  /**
   * Handle the raw data provided by the native node messager.
   *
   * @param rawData The object obtained from parsing the message.
   */
  protected handleRawData(rawData: IMessengerMessageEventData<D>): void {
    if (rawData.action === 'execute') {
      const callNumber: number = rawData.callNumber;
      const callbackData: any = this.executeMethod(rawData.type, rawData.data);
      const msg: IMessengerMessageEventData<any> = {
        callNumber,
        type: `${rawData.type}$${callNumber}`,
        data: callbackData.data,
        resolved: callbackData.resolved,
        action: 'callback',
      };
      if (callbackData.data && callbackData.data.then) {
        callbackData.data.then(
          (r: any) => {
            msg.data = r;
            msg.resolved = true;
            this.send(msg);
          },
          (r: any) => {
            msg.data = r instanceof Error ? { message: r.message, stack: r.stack!.split('\n') } : r;
            msg.resolved = false;
            this.send(msg);
          },
        );
      } else {
        this.send(msg);
      }
    } else {
      // Call the method
      const type = rawData.type;
      const eventInfo = { type, target: this };
      const callbacks: any = this._callbacks;
      if (callbacks && callbacks[type]) {
        const obj = callbacks[type];
        if (rawData.resolved) {
          obj.resolve.call(this, rawData.data, eventInfo);
        } else {
          obj.reject.call(this, rawData.data, eventInfo);
        }
        delete callbacks[type];
      }
    }
  }

  /**
   * Sending a message via the native node message mechanism.
   */
  private send<N extends keyof C>(msg: IMessengerMessageEventData<N>): void {
    // The main process should make sure that `process.send` is present.
    this.messenger.emit(JSON.stringify(msg));
  }
}

export {
  IMessengerError,
  IMessengerEventInfo,
  IMessengerMessageEventData,
  IMessengerOutput,
  Messenger,
};

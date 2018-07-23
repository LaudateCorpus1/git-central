import { Messenger } from './Messenger';
import { MessengerEvent } from './AbstractMessenger';

interface IMethodsFromRenderer {
  getDivContent: {
    param: undefined,
    returns: string,
  };
}

interface IMethods {
  execLS: {
    param: string,
    returns: string,
  };
}

// type ImplementMe<T extends MessengerEvent<T>> = {
//   [P in Extract<keyof T, string>]: (param: T[P]['param']) => T[P]['returns'];
// };

class MainIPIC extends Messenger<IMethods, IMethodsFromRenderer> {

}

export {
  MainIPIC,
};

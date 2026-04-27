import { authorizedFetch } from '../http/authorizedFetch';
import LocalStorage from '../storage/localStorage';
import { TOKENS } from './tokens';

class Container {
  private services: Record<string, unknown> = {};

  register(token: string, instance: unknown) {
    this.services[token] = instance;
  }

  resolve<T>(token: string): T {
    const service = this.services[token];

    if (!service) {
      throw new Error(`Service not found: ${token}`);
    }

    return service as T;
  }
}

const container = new Container();

container.register(TOKENS.LocalStorage, LocalStorage);
container.register(TOKENS.AuthorizedFetch, authorizedFetch);

export default container;
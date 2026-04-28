export default class Container {
  private registry = new Map<symbol, unknown>();

  register<T>(token: symbol, instance: T): this {
    this.registry.set(token, instance);
    return this;
  }

  resolve<T>(token: symbol): T {
    const instance = this.registry.get(token);
    if (instance === undefined) {
      throw new Error(`No binding found for token: ${token.toString()}`);
    }
    return instance as T;
  }
}

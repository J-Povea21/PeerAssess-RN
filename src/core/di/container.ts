export default class Container {
<<<<<<< HEAD
  private registry = new Map<symbol, unknown>();

  register<T>(token: symbol, instance: T): this {
    this.registry.set(token, instance);
=======
  private services =
    new Map<symbol, unknown>();

  register<T>(
    token: symbol,
    instance: T
  ): Container {
    this.services.set(
      token,
      instance
    );

>>>>>>> cde6f88 ([86b9kxbb1]: add bootstrap tooling and core infrastructure)
    return this;
  }

  resolve<T>(token: symbol): T {
<<<<<<< HEAD
    const instance = this.registry.get(token);
    if (instance === undefined) {
      throw new Error(`No binding found for token: ${token.toString()}`);
    }
    return instance as T;
  }
}
=======
    const service =
      this.services.get(token);

    if (!service) {
      throw new Error(
        "service not found for token"
      );
    }

    return service as T;
  }
}
>>>>>>> cde6f88 ([86b9kxbb1]: add bootstrap tooling and core infrastructure)

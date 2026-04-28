export default class Container {
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

    return this;
  }

  resolve<T>(token: symbol): T {
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
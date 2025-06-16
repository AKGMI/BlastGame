export type ServiceFactory<T> = () => T;

export class ServiceContainer {
    private static instance: ServiceContainer;
    private services: Map<string, any> = new Map();
    private singletons: Map<string, any> = new Map();
    private factories: Map<string, ServiceFactory<any>> = new Map();

    public static getInstance(): ServiceContainer {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }

    register<T>(key: string, factory: ServiceFactory<T>): void {
        this.factories.set(key, factory);
    }

    registerSingleton<T>(key: string, factory: ServiceFactory<T>): void {
        this.factories.set(key, factory);
        this.singletons.set(key, null);
    }

    resolve<T>(key: string): T {
        if (this.singletons.has(key)) {
            let singleton = this.singletons.get(key);
            if (singleton === null) {
                const factory = this.factories.get(key);
                if (!factory) {
                    throw new Error(`Service not registered: ${key}`);
                }
                singleton = factory();
                this.singletons.set(key, singleton);
            }
            return singleton;
        }

        const factory = this.factories.get(key);
        if (!factory) {
            throw new Error(`Service not registered: ${key}`);
        }
        return factory();
    }

    registerInstance<T>(key: string, instance: T): void {
        this.services.set(key, instance);
    }

    hasService(key: string): boolean {
        return this.factories.has(key) || this.services.has(key);
    }

    clear(): void {
        this.services.clear();
        this.singletons.clear();
        this.factories.clear();
    }
} 
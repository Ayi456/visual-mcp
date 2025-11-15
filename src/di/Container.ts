/**
 * 依赖注入容器
 *
 * 提供简单的依赖注入和服务定位功能
 */

type Factory<T> = () => T | Promise<T>;
type Singleton<T> = { instance: T };

export class Container {
  private factories: Map<string, Factory<any>> = new Map();
  private singletons: Map<string, Singleton<any>> = new Map();

  /**
   * 注册工厂函数
   * @param name 服务名称
   * @param factory 工厂函数
   */
  register<T>(name: string, factory: Factory<T>): void {
    this.factories.set(name, factory);
  }

  /**
   * 注册单例
   * @param name 服务名称
   * @param factory 工厂函数
   */
  registerSingleton<T>(name: string, factory: Factory<T>): void {
    this.factories.set(name, async () => {
      if (this.singletons.has(name)) {
        return this.singletons.get(name)!.instance;
      }

      const instance = await factory();
      this.singletons.set(name, { instance });
      return instance;
    });
  }

  /**
   * 注册实例
   * @param name 服务名称
   * @param instance 实例对象
   */
  registerInstance<T>(name: string, instance: T): void {
    this.singletons.set(name, { instance });
    this.factories.set(name, () => instance);
  }

  /**
   * 解析服务
   * @param name 服务名称
   * @returns 服务实例
   */
  async resolve<T>(name: string): Promise<T> {
    const factory = this.factories.get(name);

    if (!factory) {
      throw new Error(`服务 '${name}' 未注册`);
    }

    return await factory();
  }

  /**
   * 检查服务是否已注册
   * @param name 服务名称
   */
  has(name: string): boolean {
    return this.factories.has(name);
  }

  /**
   * 清除所有注册
   */
  clear(): void {
    this.factories.clear();
    this.singletons.clear();
  }

  /**
   * 清除特定服务
   * @param name 服务名称
   */
  remove(name: string): void {
    this.factories.delete(name);
    this.singletons.delete(name);
  }
}

/**
 * 全局容器实例
 */
export const container = new Container();

/**
 * 服务名称常量
 */
export const ServiceNames = {
  PANEL_MANAGER: 'PanelManager',
  USER_MANAGER: 'UserManager',
  HTTP_SERVER: 'HttpServer',
  CLEANUP_SCHEDULER: 'CleanupScheduler',
  QUOTA_SCHEDULER: 'QuotaScheduler',
  MCP_SERVER: 'McpServer',
  CONFIG: 'Config',
} as const;

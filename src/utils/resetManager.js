import { resetSingletonInstances, getSingletonInstanceKeys } from './singletonFactory';

// 模組分組配置
const MODULE_GROUPS = {
  notification: [
    'useNotificationApi',
    'useNotificationData',
    'usePopupControl',
    'useNotificationStorage',
    'usePollingManager'
  ]
};

// 重置管理器
export class ResetManager {
  // 重置指定模組的單例
  static resetModuleSingletons(moduleName) {
    const keys = MODULE_GROUPS[moduleName];
    if (keys) {
      console.log(`重置 ${moduleName} 模組單例實例...`);
      resetSingletonInstances(keys);
    } else {
      console.warn(`未找到模組: ${moduleName}`);
    }
  }

  // 重置所有單例實例
  static resetAllSingletons() {
    console.log('重置所有單例實例...');
    resetSingletonInstances();
  }

  // 重置指定的單例實例
  static resetSpecificSingletons(keys) {
    console.log(`重置指定的單例實例: ${keys.join(', ')}`);
    resetSingletonInstances(keys);
  }

  // 獲取所有單例鍵值
  static getAllSingletonKeys() {
    return getSingletonInstanceKeys();
  }

  // 獲取模組分組配置
  static getModuleGroups() {
    return { ...MODULE_GROUPS };
  }

  // 添加新的模組分組
  static addModuleGroup(moduleName, keys) {
    MODULE_GROUPS[moduleName] = keys;
  }

  // 用戶登出時的重置
  static resetOnLogout() {
    console.log('用戶登出，執行重置操作...');
    // 重置所有模組的單例
    Object.keys(MODULE_GROUPS).forEach(moduleName => {
      this.resetModuleSingletons(moduleName);
    });
  }

  // 權限變更時的重置
  static resetOnRoleChange() {
    console.log('權限變更，執行重置操作...');
    this.resetAllSingletons();
  }

  // 商家切換時的重置
  static resetOnMerchantSwitch() {
    console.log('商家切換，執行重置操作...');
    // 重置通知模組
    this.resetModuleSingletons('notification');
  }

  // 登入狀態變更時的重置
  static resetOnLoginStateChange(isLoggedIn) {
    if (isLoggedIn) {
      console.log('用戶登入，初始化單例...');
      // 登入時不需要重置，讓單例自然初始化
    } else {
      console.log('用戶登出，重置單例...');
      this.resetOnLogout();
    }
  }

}

// 便捷函數
export const resetModuleSingletons = (moduleName) => ResetManager.resetModuleSingletons(moduleName);
export const resetAllSingletons = () => ResetManager.resetAllSingletons();
export const resetOnLogout = () => ResetManager.resetOnLogout();
export const resetOnRoleChange = () => ResetManager.resetOnRoleChange();
export const resetOnMerchantSwitch = () => ResetManager.resetOnMerchantSwitch();
// 通用工具函數統一入口

// 組合路徑工具
export function joinPath(base, path) {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// 單例工廠
export {
  createSingletonFactory,
  resetSingletonInstances,
  getSingletonInstanceKeys,
  getSingletonInstanceCount
} from './singletonFactory';

// 重置管理器
export {
  ResetManager,
  resetModuleSingletons,
  resetAllSingletons,
  resetOnLogout,
  resetOnRoleChange,
  resetOnMerchantSwitch
} from './resetManager';

// 錯誤處理器
export { useErrorHandler } from './errorHandler';
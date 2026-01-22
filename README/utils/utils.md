# 通用工具函數 (Utils)

這個目錄包含了整個專案中可重複使用的通用工具函數。

## 檔案結構

```
src/utils/
├── index.js              # 統一入口檔案
├── singletonFactory.js   # 單例工廠
├── resetManager.js       # 重置管理器
└── errorHandler.js       # 錯誤處理器
```

## 使用範例

### 模組範例
- [通知模組範例](./useExamples/notification.md) - 通知系統的使用範例

### 通用範例
- [基礎使用範例](./useExamples/basic.md) - 基礎使用場景

## 工具說明

### 1. singletonFactory.js - 單例工廠

用於創建和管理單例模式的工具。

**主要功能：**
- `createSingletonFactory(factoryFunction, instanceKey)` - 創建單例工廠
- `resetSingletonInstances(targetKeys)` - 重置單例實例
- `getSingletonInstanceKeys()` - 獲取所有單例鍵值
- `getSingletonInstanceCount()` - 獲取單例數量

### 2. resetManager.js - 重置管理器

統一管理單例重置邏輯的工具。

**主要功能：**
- `ResetManager.resetModuleSingletons(moduleName)` - 重置指定模組
- `ResetManager.resetAllSingletons()` - 重置所有單例
- `ResetManager.resetOnLogout()` - 登出時重置
- `ResetManager.resetOnRoleChange()` - 權限變更時重置
- `ResetManager.resetOnMerchantSwitch()` - 商家切換時重置

### 3. errorHandler.js - 錯誤處理器

統一的錯誤處理工具。

**主要功能：**
- `handleError(error, context, options)` - 通用錯誤處理
- `handleApiError(error, endpoint)` - API 錯誤處理
- `handleStorageError(error, operation)` - 儲存錯誤處理
- `handleValidationError(error, field)` - 驗證錯誤處理
- `handleWarning(message, context)` - 警告處理

## 模組分組

ResetManager 支援模組分組，方便按模組重置單例：

```javascript
// 預設模組分組
const MODULE_GROUPS = {
  notification: [
    'useNotificationApi',
    'useNotificationData',
    'usePopupControl',
    'useNotificationStorage',
    'usePollingManager'
  ]
};
```

## 最佳實踐

1. **統一導入**：使用 `@/utils` 統一導入所有工具
2. **模組化使用**：按功能模組分組管理單例
3. **錯誤處理**：在所有可能出錯的地方使用錯誤處理器
4. **重置時機**：在適當的時機重置單例，避免記憶體洩漏
5. **命名規範**：使用有意義的單例鍵值名稱

## 注意事項

1. 單例實例會在整個應用生命週期中保持，需要適時重置
2. 重置功能會清除所有相關狀態，請謹慎使用
3. 錯誤處理器會記錄錯誤資訊，注意隱私保護
4. 模組分組需要與實際的單例鍵值保持一致

## 如何添加新模組範例

1. 在 `useExamples/` 目錄下創建新的 `.md` 檔案
2. 參考現有範例的格式和結構
3. 在主 README 中添加連結
4. 更新模組分組配置

## 相關連結

- [Vue 3 官方文檔](https://vuejs.org/)
- [Pinia 狀態管理](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
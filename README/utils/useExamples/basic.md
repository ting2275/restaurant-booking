# 基礎使用範例

這個文件展示了通用工具函數的基礎使用方法。

## 快速開始

### 1. 導入工具

```javascript
// 統一導入
import {
  createSingletonFactory,
  ResetManager,
  useErrorHandler
} from '@/utils';

// 或分別導入
import { createSingletonFactory } from '@/utils/singletonFactory';
import { ResetManager } from '@/utils/resetManager';
import { useErrorHandler } from '@/utils/errorHandler';
```

### 2. 創建單例

```javascript
// 基礎單例創建
function createSimpleApi() {
  const data = ref([]);

  const fetchData = async () => {
    // API 邏輯
    return data.value;
  };

  return { data, fetchData };
}

export const useSimpleApi = createSingletonFactory(createSimpleApi, 'useSimpleApi');
```

### 3. 錯誤處理

```javascript
// 基礎錯誤處理
function createDataManager() {
  const { handleError, handleApiError } = useErrorHandler();

  const fetchData = async () => {
    try {
      const response = await api.get('/data');
      return response.data;
    } catch (error) {
      handleApiError(error, 'fetchData');
      throw error;
    }
  };

  const saveData = (data) => {
    try {
      // 儲存邏輯
      localStorage.setItem('data', JSON.stringify(data));
    } catch (error) {
      handleError(error, 'saveData', {
        logToConsole: true,
        customMessage: '資料儲存失敗'
      });
    }
  };

  return { fetchData, saveData };
}

export const useDataManager = createSingletonFactory(createDataManager, 'useDataManager');
```

## 常見使用模式

### 1. API 服務模式

```javascript
function createApiService() {
  const { handleApiError } = useErrorHandler();

  const get = async (url, config = {}) => {
    try {
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error, `GET:${url}`);
      throw error;
    }
  };

  const post = async (url, data, config = {}) => {
    try {
      const response = await axios.post(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error, `POST:${url}`);
      throw error;
    }
  };

  return { get, post };
}

export const useApiService = createSingletonFactory(createApiService, 'useApiService');
```

### 2. 狀態管理模式

```javascript
function createStateManager() {
  const { handleStateError } = useErrorHandler();

  const state = ref({});
  const loading = ref(false);
  const error = ref(null);

  const setState = (key, value) => {
    try {
      state.value[key] = value;
    } catch (error) {
      handleStateError(error, 'stateManager');
    }
  };

  const clearState = () => {
    try {
      state.value = {};
      error.value = null;
    } catch (error) {
      handleStateError(error, 'stateManager');
    }
  };

  return { state, loading, error, setState, clearState };
}

export const useStateManager = createSingletonFactory(createStateManager, 'useStateManager');
```

### 3. 儲存管理模式

```javascript
function createStorageManager() {
  const { handleStorageError } = useErrorHandler();

  const setItem = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      handleStorageError(error, 'setItem');
    }
  };

  const getItem = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      handleStorageError(error, 'getItem');
      return null;
    }
  };

  const removeItem = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      handleStorageError(error, 'removeItem');
    }
  };

  return { setItem, getItem, removeItem };
}

export const useStorageManager = createSingletonFactory(createStorageManager, 'useStorageManager');
```

## 重置操作

### 1. 基礎重置

```javascript
// 重置特定單例
import { resetSingletonInstances } from '@/utils/singletonFactory';

const resetSpecificSingleton = () => {
  resetSingletonInstances('useSimpleApi');
};

// 重置多個單例
const resetMultipleSingletons = () => {
  resetSingletonInstances(['useSimpleApi', 'useDataManager']);
};

// 重置所有單例
const resetAllSingletons = () => {
  resetSingletonInstances();
};
```

### 2. 使用 ResetManager

```javascript
import { ResetManager } from '@/utils/resetManager';

// 重置指定模組
const resetModule = () => {
  ResetManager.resetModuleSingletons('notification');
};

// 重置所有單例
const resetAll = () => {
  ResetManager.resetAllSingletons();
};

// 登出時重置
const handleLogout = () => {
  ResetManager.resetOnLogout();
};
```

## 最佳實踐

### 1. 命名規範

```javascript
// ✅ 好的命名
export const useNotificationApi = createSingletonFactory(createNotificationApi, 'useNotificationApi');
export const useUserData = createSingletonFactory(createUserData, 'useUserData');

// ❌ 不好的命名
export const useApi = createSingletonFactory(createApi, 'api');
export const useData = createSingletonFactory(createData, 'data');
```

### 2. 錯誤處理

```javascript
// ✅ 好的錯誤處理
const fetchData = async () => {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetchData');
    throw error; // 重新拋出錯誤讓上層處理
  }
};

// ❌ 不好的錯誤處理
const fetchData = async () => {
  const response = await api.get('/data');
  return response.data; // 沒有錯誤處理
};
```

### 3. 重置時機

```javascript
// ✅ 適當的重置時機
const handleLogout = () => {
  userStore.clearUserInfo();
  ResetManager.resetOnLogout(); // 登出時重置
  router.push('/login');
};

const handleRoleChange = () => {
  ResetManager.resetOnRoleChange(); // 權限變更時重置
  window.location.reload();
};

// ❌ 不適當的重置時機
const handlePageChange = () => {
  ResetManager.resetAllSingletons(); // 每次頁面切換都重置
};
```

## 常見錯誤

### 1. 忘記錯誤處理

```javascript
// 錯誤：沒有錯誤處理
function createBadApi() {
  const fetchData = async () => {
    const response = await api.get('/data');
    return response.data;
  };

  return { fetchData };
}

// 正確：有錯誤處理
function createGoodApi() {
  const { handleApiError } = useErrorHandler();

  const fetchData = async () => {
    try {
      const response = await api.get('/data');
      return response.data;
    } catch (error) {
      handleApiError(error, 'fetchData');
      throw error;
    }
  };

  return { fetchData };
}
```

### 2. 忘記重置

```javascript
// 錯誤：沒有重置邏輯
const handleLogout = () => {
  userStore.clearUserInfo();
  router.push('/login');
  // 忘記重置單例，可能導致狀態混亂
};

// 正確：有重置邏輯
const handleLogout = () => {
  userStore.clearUserInfo();
  ResetManager.resetOnLogout(); // 重置單例
  router.push('/login');
};
```

### 3. 重複創建單例

```javascript
// 錯誤：重複創建單例
function createApi() {
  return { /* API 方法 */ };
}

export const useApi1 = createSingletonFactory(createApi, 'useApi');
export const useApi2 = createSingletonFactory(createApi, 'useApi'); // 重複的鍵值

// 正確：使用不同的鍵值
function createApi() {
  return { /* API 方法 */ };
}

export const useApi1 = createSingletonFactory(createApi, 'useApi1');
export const useApi2 = createSingletonFactory(createApi, 'useApi2');
```

## 進階用法

### 1. 自定義模組分組

```javascript
import { ResetManager } from '@/utils/resetManager';

// 添加自定義模組分組
ResetManager.addModuleGroup('analytics', [
  'useAnalyticsApi',
  'useAnalyticsData',
  'useAnalyticsStorage'
]);

// 重置自定義模組
const resetAnalytics = () => {
  ResetManager.resetModuleSingletons('analytics');
};
```

### 2. 條件重置

```javascript
import { ResetManager } from '@/utils/resetManager';

const conditionalReset = (condition) => {
  if (condition === 'logout') {
    ResetManager.resetOnLogout();
  } else if (condition === 'roleChange') {
    ResetManager.resetOnRoleChange();
  } else if (condition === 'merchantSwitch') {
    ResetManager.resetOnMerchantSwitch();
  }
};
```

### 3. 重置監聽

```javascript
import { getSingletonInstanceKeys } from '@/utils/singletonFactory';

const monitorSingletons = () => {
  const keys = getSingletonInstanceKeys();
  console.log('當前單例:', keys);

  // 定期檢查單例狀態
  setInterval(() => {
    const currentKeys = getSingletonInstanceKeys();
    console.log('單例數量:', currentKeys.length);
  }, 5000);
};
```
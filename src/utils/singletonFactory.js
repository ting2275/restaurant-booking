// 追蹤所有單例實例
const singletonInstances = new Map();

export function createSingletonFactory(factoryFunction, instanceKey = null) {
  // 生成實例鍵值
  const key = instanceKey || factoryFunction.name || `singleton_${Date.now()}`;

  // 追蹤實例
  singletonInstances.set(key, {
    instance: null,
    factory: factoryFunction,
    key
  });

  const useSingleton = function(...args) {
    const tracked = singletonInstances.get(key);
    if (!tracked.instance) {
      tracked.instance = factoryFunction(...args);
    }
    return tracked.instance;
  };

  // 為實例添加重置方法
  useSingleton.reset = () => {
    const tracked = singletonInstances.get(key);
    if (tracked) {
      tracked.instance = null;
    }
  };

  // 為實例添加獲取實例鍵值的方法
  useSingleton.getInstanceKey = () => key;

  return useSingleton;
}

export function resetSingletonInstances(targetKeys = null) {
  if (targetKeys) {
    // 重置指定的單例實例
    if (Array.isArray(targetKeys)) {
      targetKeys.forEach(key => {
        const tracked = singletonInstances.get(key);
        if (tracked) {
          tracked.instance = null;
        }
      });
    } else {
      // 單一鍵值
      const tracked = singletonInstances.get(targetKeys);
      if (tracked) {
        tracked.instance = null;
      }
    }
  } else {
    // 重置所有單例實例
    singletonInstances.forEach(tracked => {
      tracked.instance = null;
    });
  }

  console.log(`已重置 ${targetKeys ? (Array.isArray(targetKeys) ? targetKeys.length : 1) : singletonInstances.size} 個單例實例`);
}

export function getSingletonInstanceKeys() {
  return Array.from(singletonInstances.keys());
}

export function getSingletonInstanceCount() {
  return singletonInstances.size;
}
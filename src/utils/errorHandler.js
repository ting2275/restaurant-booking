// 通用錯誤處理器
export function useErrorHandler() {
  const handleError = (error, context = 'unknown', options = {}) => {
    const {
      logToConsole = true,
      throwError = false,
      customMessage = null,
      logLevel = 'error' // 'error', 'warn', 'info'
    } = options;

    const errorInfo = {
      error,
      context,
      timestamp: new Date().toISOString(),
      message: customMessage || error?.message || '未知錯誤',
      stack: error?.stack
    };

    if (logToConsole) {
      const logMethod = console[logLevel] || console.error;
      logMethod(`[${context}] 錯誤:`, errorInfo);
    }

    if (throwError) {
      throw error;
    }

    return errorInfo;
  };

  // 儲存相關錯誤
  const handleStorageError = (error, operation) => {
    return handleError(error, `storage:${operation}`, {
      logToConsole: false,
      customMessage: `${operation} 操作失敗`
    });
  };

  // API 相關錯誤
  const handleApiError = (error, endpoint) => {
    return handleError(error, `api:${endpoint}`, {
      logToConsole: true,
      customMessage: `API 請求失敗: ${endpoint}`
    });
  };

  // 輪詢相關錯誤
  const handlePollingError = (error, retryCount = 0) => {
    return handleError(error, 'polling', {
      logToConsole: true,
      customMessage: `輪詢錯誤 (重試次數: ${retryCount})`
    });
  };

  // 事件處理錯誤
  const handleEventError = (error, eventType) => {
    return handleError(error, `event:${eventType}`, {
      logToConsole: true,
      customMessage: `事件處理錯誤: ${eventType}`
    });
  };

  // 驗證錯誤
  const handleValidationError = (error, field) => {
    return handleError(error, `validation:${field}`, {
      logToConsole: false,
      customMessage: `驗證失敗: ${field}`
    });
  };

  // 路由錯誤
  const handleRouteError = (error, route) => {
    return handleError(error, `route:${route}`, {
      logToConsole: true,
      customMessage: `路由錯誤: ${route}`
    });
  };

  // 組件錯誤
  const handleComponentError = (error, componentName) => {
    return handleError(error, `component:${componentName}`, {
      logToConsole: true,
      customMessage: `組件錯誤: ${componentName}`
    });
  };

  // 狀態管理錯誤
  const handleStateError = (error, storeName) => {
    return handleError(error, `state:${storeName}`, {
      logToConsole: true,
      customMessage: `狀態管理錯誤: ${storeName}`
    });
  };

  // 通用警告
  const handleWarning = (message, context = 'unknown') => {
    return handleError(new Error(message), context, {
      logToConsole: true,
      logLevel: 'warn',
      customMessage: message
    });
  };

  // 通用資訊
  const handleInfo = (message, context = 'unknown') => {
    return handleError(new Error(message), context, {
      logToConsole: true,
      logLevel: 'info',
      customMessage: message
    });
  };

  return {
    handleError,
    handleStorageError,
    handleApiError,
    handlePollingError,
    handleEventError,
    handleValidationError,
    handleRouteError,
    handleComponentError,
    handleStateError,
    handleWarning,
    handleInfo
  };
}
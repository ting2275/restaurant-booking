export function useIdValidator() {
  /**
   * 驗證台灣身分證格式（英文 + 1 or 2 + 8 碼數字）
   */
  const isValidTWIDFormat = (value) => {
    return /^[A-Z][12]\d{8}$/.test(value.toUpperCase());
  };

  /**
   * 驗證統一編號格式（8 碼純數字）
   */
  const isValidGUIFormat = (value) => {
    return /^\d{8}$/.test(value);
  };

  /**
   * 綜合驗證：只檢查格式，不驗證 checksum
   */
  const isValidIdOrGUI = (value) => {
    if (!value) return false;
    const trimmed = value.toString().trim().toUpperCase();
    return isValidTWIDFormat(trimmed) || isValidGUIFormat(trimmed);
  };

  return {
    isValidTWIDFormat,
    isValidGUIFormat,
    isValidIdOrGUI
  };
}
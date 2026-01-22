// 其他共用函式
import { makePhone } from 'v-phone-input';
export function useCheckBookingForm(){
  const clearErrorMessage = input => input.errorMessage = ''
  const checkInputs = checkList => {
    // console.log('checkList', checkList)
    let isPass = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    checkList.forEach(input => {
      let item = input.value
      if (item.required && !item.model) {
        item.errorMessage = '請輸入完整資訊';
        isPass = false;
      } else if (item.model && item.type === 'email' && !emailPattern.test(item.model)) {
        item.errorMessage = '信箱格式錯誤';
        isPass = false;
      } else if (item.model && item.type === 'phone' && !makePhone(item.model).valid) {
        // 檢查電話號碼的有效性 引用套件語法
        item.errorMessage = '電話號碼格式無效';
        isPass = false;
      }
    })
    return isPass;
  }
  const checkDropdown = (input) => {
    let isPass = true;
    if (!input.value) {
      isPass = false;
    }
    return isPass;
  }
  return {
    clearErrorMessage,
    checkInputs,
    checkDropdown
  }
}
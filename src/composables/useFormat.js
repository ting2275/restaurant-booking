export function useFormat() {
  /**
   * 四捨五入並格式化數字
   * @param {number|string} value - 要處理的數字
   * @param {number} decimals - 要保留的小數位數 (預設 0 位)
   * @returns {string} - 格式化後的數字
   */

  const formatNumber = (value, decimals = 0) => {
    const numberValue = Number(value)
    if (isNaN(numberValue)) return '0'
    return numberValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  /**
   * 格式化日期函式
   * 將日期字串轉換為 "YYYY/MM/DD" 格式
   * @param {Date|string} inputDate - Date 物件 或 日期字串
   * @returns {string} 格式化後的日期字串 "YYYY/MM/DD"
   */
  const formatDate = inputDate => {
    if (!inputDate) return ''

    let year, month, day

    if (inputDate instanceof Date) {
      year = inputDate.getFullYear()
      month = String(inputDate.getMonth() + 1).padStart(2, '0')
      day = String(inputDate.getDate()).padStart(2, '0')
    } else if (typeof inputDate === 'string') {
      const cleanedDate = inputDate.trim()
      if (cleanedDate.includes('-')) {
        const [datePart] = cleanedDate.split(' ')
        ;[year, month, day] = datePart.split('-')
      } else if (cleanedDate.length >= 8) {
        const datePart = cleanedDate.slice(0, 8)
        year = datePart.slice(0, 4)
        month = datePart.slice(4, 6)
        day = datePart.slice(6, 8)
      } else {
        console.warn('formatDate 輸入格式錯誤:', inputDate)
        return ''
      }
    } else {
      return ''
    }

    return `${year}/${month}/${day}`
  }

  /**
   * 格式化日期時間函式
   * 將日期時間字串轉換為 "YYYY/MM/DD HH:mm" 格式
   * @param {Date|string} dateTimeString - Date 物件 或 日期時間字串
   * @returns {string} 格式化後的日期時間字串 "YYYY/MM/DD HH:mm"
   */
  const formatDateTime = dateTimeString => {
    if (!dateTimeString) return ''

    const date = new Date(dateTimeString)
    if (isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}/${month}/${day} ${hours}:${minutes}`
  }

  /**
   * 格式化日期函式
   * 將日期字串轉換為 "YYYY年MM月DD日" 格式
   * @param {Date|string} dateStr - Date 物件 或 日期字串
   * @param {Boolean} includeYear - 是否顯示年份
   * @returns {string} 格式化後的日期字串 "YYYY年MM月DD日 || MM月DD日"
   */
  const formatDateLocale = (dateStr, includeYear = true) => {
    const date = new Date(dateStr)
    const formattedDate = date.toLocaleDateString('zh-TW', {
      year: includeYear ? 'numeric' : undefined,
      month: 'long',
      day: 'numeric'
    })
    return formattedDate
  }

  /**
   * 格式化日期函式
   * 將日期字串轉換為 "星期X" 格式
   * @param {Date|string} dateStr - Date 物件 或 日期字串
   * @returns {string} 格式化後的星期字串 "星期X"
   */
  const formatWeekday = dateStr => {
    let weekday = String(new Date(dateStr).getDay())
    let weekMap = {
      0: '星期日',
      1: '星期一',
      2: '星期二',
      3: '星期三',
      4: '星期四',
      5: '星期五',
      6: '星期六'
    }
    return weekMap[weekday]
  }

  function formatPercent(numerator, denominator) {
    const num = Number(numerator)
    const den = Number(denominator)
    if (!isFinite(num) || !isFinite(den) || den === 0) return 0
    return Math.round((num / den) * 100)
  }

  /**
   * 格式化相對時間
   * 將時間戳轉換為相對時間字串（剛剛、X分鐘前、X小時前、X天前、X個月前）
   * @param {Date|string|number} timestamp - 時間戳
   * @returns {string} 相對時間字串
   */
  const formatRelativeTime = timestamp => {
    if (!timestamp) return ''

    const now = new Date()
    const targetTime = new Date(timestamp)
    const diff = now - targetTime

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    const months = Math.floor(diff / 2592000000)

    if (minutes < 1) return '剛剛'
    if (minutes < 60) return `${minutes} 分鐘前`
    if (hours < 24) return `${hours} 小時前`
    if (days < 30) return `${days} 天前`
    return `${months} 個月前`
  }

  return { formatNumber, formatDate, formatDateLocale, formatWeekday, formatPercent, formatRelativeTime, formatDateTime }
}

import { ref, computed } from 'vue'

export const useDateTimeRange = (options = {}) => {
  const {
    maxRangePast = 0,
    maxRangeFuture = 6,
    timeInterval = 30, // 時間間隔，預設30分鐘
    showDateRangeWarning = true,
    warningDays = 1, // 超過幾天顯示警告
    dynamicDateRange = false // 是否啟用動態計算
  } = options

  // 日期選擇器
  const selectedStartDay = ref(new Date())
  const selectedEndDay = ref(new Date())

  // 時間選擇相關
  const selectedStartTime = ref('')
  const selectedEndTime = ref('')

  // 錯誤提示訊息功能
  const validationErrors = ref({
    startDateError: '',
    startTimeError: '',
    endDateError: '',
    endTimeError: ''
  })

  const validateDateTimeRange = () => {
    const errors = {
      startDateError: '',
      startTimeError: '',
      endDateError: '',
      endTimeError: ''
    }

    // 註:未來可擴充開始日期時間驗證

    // 檢查日期
    if (selectedStartDay.value && selectedEndDay.value) {
      const startDate = selectedStartDay.value instanceof Date ? selectedStartDay.value : new Date(selectedStartDay.value)
      const endDate = selectedEndDay.value instanceof Date ? selectedEndDay.value : new Date(selectedEndDay.value)
      if (endDate < startDate) {
        errors.endDateError = '結束日期不可早於開始日期'
      }
    }
    // 檢查時間（只有當日期相同時才檢查）
    if (selectedStartDay.value && selectedEndDay.value && selectedStartTime.value && selectedEndTime.value) {
      const startDate = selectedStartDay.value instanceof Date ? selectedStartDay.value : new Date(selectedStartDay.value)
      const endDate = selectedEndDay.value instanceof Date ? selectedEndDay.value : new Date(selectedEndDay.value)
      if (startDate.toDateString() === endDate.toDateString()) {
        const startTimeInMinutes = parseInt(selectedStartTime.value.split(':')[0]) * 60 + parseInt(selectedStartTime.value.split(':')[1])
        const endTimeInMinutes = parseInt(selectedEndTime.value.split(':')[0]) * 60 + parseInt(selectedEndTime.value.split(':')[1])
        if (endTimeInMinutes < startTimeInMinutes) {
          errors.endTimeError = '結束時間不可早於開始時間'
        }
      }
    }
    validationErrors.value = errors
    return errors
  }

  const isAddDisabled = computed(() => {
    const errors = validateDateTimeRange()
    return !!(errors.startDateError || errors.startTimeError || errors.endDateError || errors.endTimeError)
  })

  const hasValidationErrors = computed(() => {
    return !!(
      validationErrors.value.startDateError ||
      validationErrors.value.startTimeError ||
      validationErrors.value.endDateError ||
      validationErrors.value.endTimeError
    )
  })

  const handleStartDateChange = date => {
    const newStartDate = date instanceof Date ? date : new Date(date)
    const oldStartDate = selectedStartDay.value
    selectedStartDay.value = newStartDate
    const now = new Date()
    const isNewDateToday = newStartDate.toDateString() === now.toDateString()
    const wasOldDateToday = oldStartDate && oldStartDate.toDateString() === now.toDateString()
    if (isNewDateToday && (!wasOldDateToday || isTimeExpired(selectedStartTime.value))) {
      const nextTime = getNextTimeSlot()
      selectedStartTime.value = nextTime
      if (selectedEndDay.value && selectedEndDay.value.toDateString() === now.toDateString()) {
        selectedEndTime.value = nextTime
      }
    }
    validateDateTimeRange()
  }

  const handleEndDateChange = date => {
    const newEndDate = date instanceof Date ? date : new Date(date)
    const oldEndDate = selectedEndDay.value
    selectedEndDay.value = newEndDate
    const now = new Date()
    const isNewDateToday = newEndDate.toDateString() === now.toDateString()
    const wasOldDateToday = oldEndDate && oldEndDate.toDateString() === now.toDateString()
    if (isNewDateToday && (!wasOldDateToday || isTimeExpired(selectedEndTime.value))) {
      const nextTime = getNextTimeSlot()
      selectedEndTime.value = nextTime
    }
    validateDateTimeRange()
  }

  //檢查時間是否已過期
  const isTimeExpired = timeString => {
    if (!timeString) return false
    const now = new Date()
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes()
    const [hours, minutes] = timeString.split(':').map(Number)
    const timeInMinutes = hours * 60 + minutes
    return timeInMinutes <= currentTimeInMinutes
  }

  const handleStartTimeChange = time => {
    selectedStartTime.value = time
    validateDateTimeRange()
  }

  const handleEndTimeChange = time => {
    selectedEndTime.value = time
    validateDateTimeRange()
  }

  // 生成時間選項
  const generateTimeOptions = selectedDay => {
    const options = []
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += timeInterval) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        const timeInMinutes = hour * 60 + minute

        const isToday = selectedDay && selectedDay.toDateString() === now.toDateString()
        const isPastTime = isToday && timeInMinutes <= currentTime

        options.push({
          label: timeString,
          value: timeString,
          disabled: isPastTime
        })
      }
    }
    return options
  }

  const timeOptions = computed(() => generateTimeOptions(selectedStartDay.value))
  const endTimeOptions = computed(() => generateTimeOptions(selectedEndDay.value))

  // 獲取最接近當下時間的下一個時段
  const getNextTimeSlot = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    let nextHour = currentHour
    let nextMinute = Math.ceil(currentMinute / timeInterval) * timeInterval
    if (nextMinute >= 60) {
      nextMinute = 0
      nextHour = (nextHour + 1) % 24
    }
    return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`
  }

  // 初始化選中的時間
  const initSelectedTime = () => {
    const nextTime = getNextTimeSlot()
    selectedStartTime.value = nextTime
    selectedEndTime.value = nextTime
  }

  // 日期範圍警告
  const showDateRangeWarningComputed = computed(() => {
    if (!showDateRangeWarning || !selectedStartDay.value || !selectedEndDay.value) {
      return false
    }
    const startDate = selectedStartDay.value instanceof Date ? selectedStartDay.value : new Date(selectedStartDay.value)
    const endDate = selectedEndDay.value instanceof Date ? selectedEndDay.value : new Date(selectedEndDay.value)
    const startOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    const timeDiff = endOfDay.getTime() - startOfDay.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)
    const totalDays = daysDiff + 1
    return totalDays > warningDays
  })

  const dateRangeDays = computed(() => {
    if (!dynamicDateRange) {
      return 2
    }
    if (!selectedStartDay.value || !selectedEndDay.value) {
      return 0
    }
    const startDate = selectedStartDay.value instanceof Date ? selectedStartDay.value : new Date(selectedStartDay.value)
    const endDate = selectedEndDay.value instanceof Date ? selectedEndDay.value : new Date(selectedEndDay.value)
    const startOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    const timeDiff = endOfDay.getTime() - startOfDay.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)
    return daysDiff + 1
  })

  // 獲取完整的日期時間字符串
  const getDateTimeRange = () => {
    const startDate = selectedStartDay.value instanceof Date ? selectedStartDay.value : new Date(selectedStartDay.value)
    const endDate = selectedEndDay.value instanceof Date ? selectedEndDay.value : new Date(selectedEndDay.value)
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    return {
      startDateTime: `${startDateStr} ${selectedStartTime.value}:00`,
      endDateTime: `${endDateStr} ${selectedEndTime.value}:00`,
      startDate: startDateStr,
      endDate: endDateStr,
      startTime: selectedStartTime.value,
      endTime: selectedEndTime.value
    }
  }

  return {
    // 響應式數據
    selectedStartDay,
    selectedEndDay,
    selectedStartTime,
    selectedEndTime,
    timeOptions,
    endTimeOptions,
    showDateRangeWarning: showDateRangeWarningComputed,
    dateRangeDays,
    validationErrors,
    isAddDisabled,
    hasValidationErrors,
    // 方法
    handleStartDateChange,
    handleEndDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    initSelectedTime,
    getDateTimeRange,
    validateDateTimeRange,
    // 配置選項
    maxRangePast,
    maxRangeFuture
  }
}

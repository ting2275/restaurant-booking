import { ref, computed } from 'vue';
//選擇人數(下拉)
export function usePeopleOptions(shopInfo, initialValue = 2) {
  const peopleOptions = computed(() => {
    let result = [];
    // const maxParty = shopInfo.partyData
    //   .filter(table => table.quantity !== '0')
    //   .reduce((max, item) => (item.table > max ? item.table : max), 0);
    const maxParty = shopInfo.maxPartySize
    console.log('shopInfo',shopInfo)
    for (let i = 1; i <= maxParty; i++) {
      result.push({ label: `${i}`, value: i });
    }
    return result;
  });
  const isPeopleOptionsEmpty = computed(() => peopleOptions.value.length === 0);
  const getDefaultPeople = () => {
    if (isPeopleOptionsEmpty.value) return 0;
    return peopleOptions.value.find(item => item.value === initialValue)
      ? initialValue
      : peopleOptions.value[0]?.value || 0;
  };
  const selectedPeople = ref(getDefaultPeople());
  return {
    peopleOptions,
    isPeopleOptionsEmpty,
    selectedPeople,
    getDefaultPeople
  };
}

// 選擇日期(下拉)
import { getBusinessTime } from '@/services/api/booking'
export function useDateOptions(date) {
  const businessTime = ref([])
  const selectedDate = ref(date);
  const isBusinessTimeEmpty = computed(() => businessTime.value.length === 0)
  const handleDateChangeInput = async (date) => {
    if (date === 'Invalid date') return
    selectedDate.value = date;
    await getBusinessTime(date).then(result => {
      businessTime.value = (result.data.noBookingPeriod === '1') ? [] : result.data.dateTime
    })
  }
  return {
    businessTime,
    selectedDate,
    isBusinessTimeEmpty,
    handleDateChangeInput
  }
}

// 選擇時間(下拉)
import { checkTimeDuringBusinessHours } from '@/composables/modules/reservationOverview/useShopInfo.js'
export function useTimeOptions(shopInfo, businessTime) {
  const timeOptions = computed(() => {
    let result = []
    businessTime.value.forEach((hour) => {
      result.push({ label: hour, value: hour })
    })
    return result
  })
  const getNextAvailableTime = () => {
    const now = new Date();
    let nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    let nowTimeNumber = Number(nowTime.replace(':', ''))
    let nextTime = businessTime.value.find(time => Number(time.replace(':', '')) >= nowTimeNumber)
    let isInBusinessHours = checkTimeDuringBusinessHours(shopInfo.openTime, shopInfo.closeTime ,nowTime)
    let isInOptions = businessTime.value.includes(nextTime)
    return (isInBusinessHours && isInOptions) ? nextTime : businessTime.value[0]
  }
  // const selectedTime = ref(getNextAvailableTime())
  const selectedTime = ref('')
  return {
    selectedTime,
    timeOptions,
    getNextAvailableTime
  }
}

// for mapping api and components params
const matchButtonVariants = {
  'true': 'secondary',
  'false': 'not-open'
}

// 取得可預訂桌型
import { batchAvailabilitySeat } from '@/services/api/booking'
export function useAvailablePartyList() {
  const availablePartyList = ref([])
  const getAvailablePartyList = async (dateTime, effectivePartySize) => {
    if(!dateTime || !effectivePartySize) return
    try {
      const result = await batchAvailabilitySeat(dateTime, effectivePartySize)
      availablePartyList.value = result.slotTimeAvailability
        // .filter(item => item.partySize >= selectedPeople.value)
        .map(item => (
          {
            ...item,
            variant: matchButtonVariants[item.available],
          }
        ));
    } catch (error) {
      console.error('Error get Available Time List:', error);
    }
  }
  return {
    availablePartyList,
    getAvailablePartyList
  }
}


// 取得可預訂時段
import { batchAvailabilityLookup } from '@/services/api/booking'
export function useAvailableTimeList() {
  const availableTimeList = ref([])
  const isAllFull = ref(false)
  const allFullMessage = ref('')
  const getAvailableTimeList = async (dateTime, partySize , editingCardId = null) => {
    if(!dateTime || !partySize) return
    try {
      const result = await batchAvailabilityLookup(dateTime, partySize, editingCardId)
      availableTimeList.value = result.slotTimeAvailability.map(item => ({
        ...item,
        variant: matchButtonVariants[item.available],
        selected: false
        }
      ))
      isAllFull.value = Boolean(result.allFull) // 回傳 true or 空值(或false)
      if(result.slotTimeAvailability.length !== 0) {
        allFullMessage.value = `此桌型於${result.slotTimeAvailability.at(0).time} ~ ${result.slotTimeAvailability.at(-1).time}之間預訂已滿`
      }
    } catch (error) {
      console.error('Error get Available Time List:', error);
    }
  }
  return {
    availableTimeList,
    isAllFull,
    allFullMessage,
    getAvailableTimeList
  }
}

// 取得可預訂桌號
import { batchAvailabilityTables } from '@/services/api/booking'
export function useAvailableTablesList() {
  const availableTablesList = ref([])
  const tableOptions = ref([])
  const getAvailableTablesList = async (dateTime, selectedPartySize, tableId = null , bookingId = null) => {
    if(!dateTime || !selectedPartySize) return
    try {
      const result = await batchAvailabilityTables(dateTime, selectedPartySize, tableId , bookingId)
      availableTablesList.value = result.filter(item => item.isAssign === 1)
      tableOptions.value = [...availableTablesList.value.map(item => ({
        label: `${item.partySize}人桌 (${item.areaName}-${item.tableName})`,
        value: item.tableId,
        tablePartySize: item.partySize
      }))
      ]
    } catch (error) {
      console.error('Error get Available Tables List:', error);
    }
  }
  return {
    availableTablesList,
    tableOptions,
    getAvailableTablesList
  }
}
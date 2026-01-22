import { ref, onMounted } from 'vue';
import { getShopInfo } from '@/services/api/shop';

export function useShopInfo() {
  const shopInfo = ref({})
  // const shopInfo = ref(null)
  const isLoading = ref(true);
  const error = ref(null);

  // 計算營業時間的函數
  const useOpenHours = (openTimeArray, closeTimeArray) => {
    if (!openTimeArray || !closeTimeArray) return [];

    const toMinutes = (timeArray) => timeArray[0] * 60 + timeArray[1];

    const totalMinutesOpen = toMinutes(openTimeArray);
    const totalMinutesClose = toMinutes(closeTimeArray);

    let diffInMinutes
    let diffInHours //完整的小時差 = 陣列長度 = 橫軸格數

    const isOvernight = totalMinutesOpen > totalMinutesClose; // 跨夜
    const isAllDayOpen = (totalMinutesOpen === totalMinutesClose)? true:false; //營業開始結束為同樣時間，即24小時營業
    // const isCloseHalfoClock = (totalMinutesClose % 60 !== 0)? true:false; //營業結束時間不為整點
    const isBothHalfoClock = (totalMinutesOpen % 60 !== 0 && totalMinutesClose % 60 !== 0)? true:false; //營業開始結束時間不為整點

    if(isOvernight) {
      let minutesBeforeNextday = (24 - openTimeArray[0]) * 60 - openTimeArray[1]
      diffInMinutes =  minutesBeforeNextday + totalMinutesClose
    }else{
      diffInMinutes = totalMinutesClose - totalMinutesOpen;
    }

    if(isAllDayOpen){
      // diffInHours = 24
      return Array.from({ length: 24 }, (_, i) => {
        const hour = i % 24;
        return hour.toString().padStart(2, '0');
      })
    }else{
      diffInHours = Math.round(diffInMinutes / 60)

      if(isBothHalfoClock) diffInHours += 1; // 營業開始及結束時間皆不為整點

      // if(isCloseHalfoClock || diffInMinutes === 30){ // 結束營業時間為30分 || 只營業半小時
      //   diffInHours += 1;
      // }
      return Array.from({ length: diffInHours }, (_, i) => {
        const hour = (openTimeArray[0] + i) % 24;
        return hour.toString().padStart(2, '0');
      })

    }

  };

  const fetchShopInfo = async () => {
    try {
      const result = await getShopInfo();
      const openTimeArray = result.openTime.split(':').map(Number);
      const closeTimeArray = result.closeTime.split(':').map(Number);
      const isOvernight = (openTimeArray[0] * 60 + openTimeArray[1] > closeTimeArray[0] * 60 + closeTimeArray[1])

      shopInfo.value = {
        openTime: result.openTime,
        closeTime: result.closeTime,
        eachTime: result.eachTime,
        partyData: result.partySizePicker,
        timePicker: result.timePicker,
        // cardSpan: Math.floor(result.eachTime / 30),
        openTimeArray: openTimeArray,
        closeTimeArray: closeTimeArray,
        openHours: useOpenHours(openTimeArray, closeTimeArray),
        isOvernight : isOvernight,
        tables: result.tables,
        maxPartySize: result.maxPartySize,
        availableTime: result.availableTime
      };
    } catch (err) {
      error.value = err.message || 'Error fetching shop information';
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(async () => {
    await fetchShopInfo();
  });

  return {
    shopInfo,
    isLoading,
    error,
    fetchShopInfo // 確保這個方法返回，以便需要時調用
  };
}


export function getLastAvalibleTime(selectedDate,timePicker){
  let weekday = String(new Date(selectedDate).getDay())
  let timePickerArray = timePicker.map((item)=>item.split(','))
  let todayTimePicker = timePickerArray.filter(item=>item[0]===weekday).map(item=>item[1].split(':'))
  if(todayTimePicker.length === 0) return ['00','00'] // 如果今天沒有可預訂時間，則回傳00:00 導致不補格子
  let lastBookingTimeArray = todayTimePicker.reduce((max, current) => {
    const maxNum = Number(max.join(''));
    const currentNum = Number(current.join(''));
    return currentNum > maxNum ? current : max;
  });
  return lastBookingTimeArray
}

export function checkTimeDuringBusinessHours(start, end, target){
  if (start === end) return true
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = toMinutes(start); // 22:00 => 1320
  const endMinutes = toMinutes(end) + (end < start ? 1440 : 0); // 06:00 => 360 + 1440 = 1800
  const targetMinutes = toMinutes(target);

  // 將目標時間的分鐘數處理為同一天或跨日
  const adjustedTarget = targetMinutes + (targetMinutes < startMinutes ? 1440 : 0);

  // 檢查是否在區間內
  return adjustedTarget >= startMinutes && adjustedTarget < endMinutes;
}

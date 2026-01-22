import { ref } from 'vue';
import { getReservationList } from '@/services/api/booking';

export function useReservationList() {
  const isReservationListBuilded = ref(false);
  const statusCounts = ref({});
  const reserveTotal = ref({});
  const reservationList = ref([]);

  const buildReservationList = async (selectedDate,shopInfo) => {
    const isOvernight = shopInfo.isOvernight
    const openTime = shopInfo.openTime
    const closeTime = shopInfo.closeTime

    const nextday = new Date(selectedDate)
    nextday.setDate(nextday.getDate()+1)
    let nextDate = nextday.toISOString().split('T')[0]
    reservationList.value = [] // 清空預訂列表
    let listD1 = []
    let listD2 = []

    await getReservationList(selectedDate)
      .then((result)=>{
        listD1 = result.data.data
      })
      .catch((error)=>console.log('getReservationList error',error))

    if(!isOvernight){
      reservationList.value = listD1
      calcReservationCounts(listD1)
    }else{
      await getReservationList(nextDate)
      .then((result)=>{
        listD2 = result.data.data
      })
      .catch((error)=>console.log('getReservationList error',error))
      let combineList = getHalfDayList(listD1,listD2,openTime,closeTime)
      reservationList.value = combineList
      calcReservationCounts(combineList)
    }

    isReservationListBuilded.value = true;
  }

  const getHalfDayList = (listD1,listD2,openTime,closeTime) =>{
    let openTimeNumber = openTime.replace(':','')
    let closeTimeNumber = closeTime.replace(':','')
    let listD1TimeArray = listD1.filter(item=>{
      let itemTimeNumer = item.bookingTime.replace(':','')
      return ((itemTimeNumer < 2400) && (itemTimeNumer >= openTimeNumber))
    })
    let listD2TimeArray = listD2.filter(item=>{
      let itemTimeNumer = item.bookingTime.replace(':','')
      return ((itemTimeNumer < closeTimeNumber) && (itemTimeNumer >= 0))
    })

    return [...listD1TimeArray,...listD2TimeArray]
  }

  const calcReservationCounts = async (list) => {

    let totalPrepare = list.filter(item=>item.reservationStatus === 'prepare').length
    let totalConfirmed = list.filter(item=>item.reservationStatus === 'CONFIRMED').length
    let totalSeated = list.filter(item=>item.reservationStatus === 'seated').length
    statusCounts.value = {
      totalPrepare,
      totalConfirmed,
      totalSeated
    };

    let totalPartySize = list.reduce((accumulator, item) => accumulator + item.effectivePartySize, 0);
    let totalCount = list.length
    reserveTotal.value = {
      totalPartySize,
      totalCount
    };
  };

  return {
    reservationList,
    statusCounts,
    reserveTotal,
    isReservationListBuilded,
    calcReservationCounts,
    buildReservationList
  };
}

export function usePageturn(){
  const checkTurnNextDay = (time, closeTime) => {
    let timeNumber = Number(time.replace(':',''))
    let closeTimeNumber = Number(closeTime.replace(':',''))
    return (timeNumber < closeTimeNumber) && (timeNumber >= 0)
  }
  const getPrevDay = date => {
    let prevDay = new Date(date)
    prevDay.setDate(prevDay.getDate()-1)
    return prevDay.toISOString().split('T')[0]
  }

  return {
    checkTurnNextDay,
    getPrevDay
  }
}
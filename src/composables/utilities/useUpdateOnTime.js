let intervalIdSet = {};
let timeoutIdSet = {};
export function useUpdateOnTime(action,period,timerName){

  if (intervalIdSet[timerName]) clearInterval(intervalIdSet[timerName]);
  if (timeoutIdSet[timerName]) clearTimeout(timeoutIdSet[timerName]);

  let now = new Date()
  let fullMinutes = (now.getMinutes() % period == 0)? period : (period - now.getMinutes() % period) //運算用
  let fullSeconds = (now.getMilliseconds() % 1000 == 0)? 0 : 1 //運算用
  let millisecondsUntilNextPeriod = (fullMinutes * 60 - now.getSeconds()) * 1000 - (fullSeconds * 1000 - now.getMilliseconds())

  let timeoutId = setTimeout(() => {
    action() // 執行動作
    let intervalId = setInterval(()=>{
      action() // 執行動作
    }, period * 60 * 1000); //每period(分鐘數)時間到執行一次
    intervalIdSet[timerName] = intervalId

  }, millisecondsUntilNextPeriod) ;
  timeoutIdSet[timerName] = timeoutId
}

// action (funtion) 要執行的動作
// period (Number) 循環的時間
// timerName (String) 計時器名稱，清除計時器用

// 此function會在最接近所傳入的period值，和往後的每隔period值時都執行指定動作
// ex. {period = 30}，則每半點鐘、整點鐘執行； {period = 10} 則每10分、20分...整點執行
// period 最小單位 1 = 1分鐘，每分鐘跳表時執行
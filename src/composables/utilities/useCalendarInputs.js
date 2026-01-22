export function useDisablePeriod(maxRangePast,maxRangeFuture){
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pastDisableDate = (maxRangePast >= 0)
    ? new Date(today.getTime() - maxRangePast * 24 * 60 * 60 * 1000)
    : false
  const futureDisableDate = (maxRangeFuture >= 0)
    ? new Date(today.getTime() + maxRangeFuture * 24 * 60 * 60 * 1000)
    : false

  return{
    pastDisableDate,
    futureDisableDate
  }
}
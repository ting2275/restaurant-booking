import { getDateStatuses } from '@/services/api/booking';
// 生成 dateClasses 的函數
export const generateDateClasses = async() => {
  let statusData = await getDateStatuses()
  statusData.splice(1,1) // 刪掉今天
  return statusData.reduce((classes, item) => {
    const dateKey = item.date;
    const statusClass = item.status;
    classes[dateKey] = statusClass;
    return classes;
  }, {});
};
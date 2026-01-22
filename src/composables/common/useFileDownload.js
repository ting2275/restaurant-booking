export const useCSVDownload = (fileResult, fileName) => {
  const csvContent = '\uFEFF' + fileResult; // \uFEFF 是 UTF-8 的 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.csv`); // 設定下載的文件名
  document.body.appendChild(link);
  link.click(); // 自動點擊連結，觸發下載
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link); // 下載完畢後移除連結
}
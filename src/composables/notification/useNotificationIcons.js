import serviceDefault from '@/assets/images/icons/mail-large.svg';
import serviceClicked from '@/assets/images/icons/mail-large-filled.svg';
import noticeRead from '@/assets/images/icons/notice-bell.svg';
import noticeBellNew from '@/assets/images/icons/notice-bell-new.svg';
import noticeBellClicked from '@/assets/images/icons/notice-bell-filled.svg';

export function useNotificationIcons() {
  const getServiceIcon = (isOpen) => {
    return isOpen ? serviceClicked : serviceDefault;
  };

  const getNotifyIcon = (isNew, isClicked) => {
    if (isNew) return noticeBellNew;
    if (isClicked) return noticeBellClicked;
    return noticeRead;
  };

  return { getServiceIcon, getNotifyIcon };
}
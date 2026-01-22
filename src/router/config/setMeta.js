import { useHead } from '@vueuse/head';

export function usePageMeta(to) {
  const dynamicTitle = to.meta.dynamicTitle || 'Restaurant Booking System';
  const pageTitle = to.meta.pageTitle || 'Restaurant Booking System';
  const metaTags = to.meta.metaTags || [];

  useHead({
    title: dynamicTitle,
    pageTitle: pageTitle,
    meta: metaTags,
  });
}
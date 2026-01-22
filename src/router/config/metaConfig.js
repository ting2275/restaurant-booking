export const settingMeta = (metaConfig) => {
  return {
    requiresAuth: metaConfig.requiresAuth !== false,
    title: metaConfig.title,
    pageTitle: metaConfig.pageTitle,
    dynamicTitle: metaConfig.dynamicTitle,
    dynamicDescription: metaConfig.dynamicDescription,
    dynamicOgDescription: metaConfig.dynamicOgDescription,
    metaTags: [
      { name: 'description', content: metaConfig.dynamicDescription },
      { property: 'og:description', content: metaConfig.dynamicOgDescription },
      { name: 'keyword', content: metaConfig.keyword },
    ],
  };
};
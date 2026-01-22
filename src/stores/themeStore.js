import { defineStore } from 'pinia';

export const useTheme  = defineStore('theme', {
    state: () => ({
        backgroundClass: 'bg-white',
    }),
    actions: {
        setBackgroundClass(className) {
            this.backgroundClass = className;
        },
    },
});
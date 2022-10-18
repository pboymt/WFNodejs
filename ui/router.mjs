import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from './pages/home-page.mjs';

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        HomePage
    ]
});
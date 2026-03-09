import { createRouter, createWebHashHistory } from 'vue-router';
import Index from '@/views/Index';
import ChartPreviewPage from '@/views/ChartPreviewPage';
import Oobe from '@/views/Oobe';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Index },
    { path: '/chart-preview', component: ChartPreviewPage },
    { path: '/oobe', component: Oobe, name: 'oobe' },
    { path: '/server', component: Oobe, name: 'server' },
    { path: '/set-mode', component: Oobe, name: 'set-mode' },
  ],
});

export default router;

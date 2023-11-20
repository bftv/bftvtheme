//import { createRouter, createWebHistory } from 'vue-router';

// Import your Vue components (UserManagement and DepartmentManagement) if necessary.
import UserManagement from '../components/UserManagement.vue';
//import DepartmentManagement from '../components/DepartmentManagement.vue';

const routes = [
  { path: '/', component: UserManagement },
  //{ path: '/user-management', component: UserManagement },
  //{ path: '/department-management', component: DepartmentManagement },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  linkExactActiveClass: "active",
  routes: [
    {
        path: '/:pathMatch(.*)*',
        name: 'user-management',
        component: UserManagement
    },
  ]
});

// No need to import VueRouter if it's already included in .info.yml and managed by PDBVue.

const app = Vue.createApp({});
//app.component('the-navigation', TheNavigation);
app.use(router);
app.mount('#reporting-block');
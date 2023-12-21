import { createRouter, createWebHashHistory } from 'vue-router';
//import components
import UserManagement from './components/UserManagement.vue';
import DepartmentManagement from './components/DepartmentManagement.vue';
import EmailManagement from './components/EmailManagement.vue';
import Resubmit from './components/ResubmitApps.vue';
import Apps from './components/Apps.vue';

//import mixins
import { navmixin } from './mixins/navMixin.js';

//let role = navmixin.methods.returnRole.call(navmixin.data());console.log(role);

/* Router */
const router = createRouter({
  history: createWebHashHistory(),
  linkExactActiveClass: "active",
  linkActiveClass: "active",

  routes: [
    { path: '/', name: 'new-apps', component: Apps },
    { path: '/view:id',  name: 'GsrMgmtFiltered', component: Apps },
    { path: '/pen-apps', name: 'pen-apps', component: Apps },
    { path: '/com-apps', name: 'com-apps', component: Apps },
    { path: '/rej-apps', name: 'rej-apps', component: Apps },
    { path: '/users', name: 'users', component: UserManagement },
    { path: '/departments', name: 'departments', component: DepartmentManagement },
    { path: '/email-templates', name: 'email-templates', component: EmailManagement },
    { path: '/:pathMatch(.*)*', name: 'new-apps-any', component: Apps, props: true }
  ]
});
/* End Router */

/* Components */
const TheNavigation = {
  mixins: [navmixin],
  template: '#nav-template',
  methods: {
    loader() {
      this.loading = true;
    }
  }
};
/* End Components */

/* Initialize */
const app = Vue.createApp({});
app.component('the-navigation', TheNavigation);
app.use(router);
app.mount('#gsr-block');
/* End Initialize */
import { createRouter, createWebHashHistory } from 'vue-router';
//import components
import UserManagement from './components/UserManagement.vue';
import DepartmentManagement from './components/DepartmentManagement.vue';
import EmailManagement from './components/EmailManagement.vue';
import Settings from './components/Settings.vue';
import Apps from './components/Apps.vue';

//import mixins
import store from './store';

/* Components */
const TheNavigation = {
  template: '#nav-template',
  created() {
    this.$store.dispatch('fetchUserData');
  },
  methods: {
    loader() {
      this.loading = true;
    },
    roleAnalyser(role){
      var crole;
      if(role == 'superadmin'){
        crole = 'SuperAdmin'
      } else if(role == 'orgadmin'){
        crole = 'OrgAdmin'
      } else if(role == 'editor'){
        crole = 'Editor'
      } else if(role == 'viewer'){
        crole = 'Viewer'
      } else if(role == 'submitter'){
        crole = 'Submitter'
      } else {
        crole = 'none'
      }
      return crole;
    }
  },
  computed: {
    curlRole() {
      return this.$store.state.curlRole;
    },
    curlName() {
      return this.$store.state.curlName;
    },
    authText() {
      return this.$store.state.authText;
    },
    accessLevels() {
      return {
        level0s: this.$store.state.accesslevel0s,
        level0r: this.$store.state.accesslevel0r,
        level0: this.$store.state.accesslevel0,
        level1: this.$store.state.accesslevel1,
        level2: this.$store.state.accesslevel2
      };
    },
    viewermode() {
      return this.$store.state.viewermode;
    },
  },
};
/* End Components */

/* Router */
const router = createRouter({
  history: createWebHashHistory(),
  linkExactActiveClass: "active",
  linkActiveClass: "active",

  routes: [
    { path: '/', name: 'new-apps', component: Apps },
    { path: '/view',  name: 'GsrMgmtFiltered', component: Apps },
    { path: '/pen-apps', name: 'pen-apps', component: Apps },
    { path: '/com-apps', name: 'com-apps', component: Apps },
    { path: '/rej-apps', name: 'rej-apps', component: Apps },
    { path: '/my-apps', name: 'my-apps', component: Apps },
    { path: '/users', name: 'users', component: UserManagement },
    { path: '/departments', name: 'departments', component: DepartmentManagement },
    { path: '/email-templates', name: 'email-templates', component: EmailManagement },
    { path: '/settings', name: 'settings', component: Settings },
    { path: '/:pathMatch(.*)*', name: 'new-apps-any', component: Apps, props: true }
  ]
});
router.beforeEach((to, from, next) => {
  const curlRole = store.state.curlRole; // Access the role from the Vuex store

  // Redirect submitters from the root path to 'my-apps'
  if (curlRole === 'submitter' && to.path === '/') {
    next({ name: 'my-apps' });
    this.location.reload();
  } else {
    next(); // Proceed with the navigation
  }
});
/* End Router */

/* Initialize */
const app = Vue.createApp({});
app.component('the-navigation', TheNavigation);
app.use(router);
app.use(store);
app.mount('#gsr-block');
/* End Initialize */
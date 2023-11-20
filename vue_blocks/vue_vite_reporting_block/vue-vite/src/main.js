import { createRouter, createWebHashHistory } from 'vue-router';
//import components
import UserManagement from './components/UserManagement.vue';
import DepartmentManagement from './components/DepartmentManagement.vue';
import ADGroupManagement from './components/ADGroupManagement.vue';
import ADGroupMembers from './components/ADGroupMembers.vue';
import ADGroupMembersVerify from './components/ADGroupMembersVerify.vue';
import ADGroupSync from './components/ADGroupSync.vue';
import ImportData from './components/ImportData.vue';

//import mixins
import { navmixin } from './mixins/navMixin.js';

const router = createRouter({
  history: createWebHashHistory(),
  linkExactActiveClass: "active",
  linkActiveClass: "active",
  routes: [
    { path: '/departments', name: 'departments', component: DepartmentManagement },
    { path: '/adgroups', name: 'adgroups', component: ADGroupManagement },
    { path: '/users', name: 'users', component: UserManagement },
    { path: '/sync', name: 'sync', component: ADGroupSync },
    { path: '/import', name: 'import', component: ImportData },
    { path: '/verify', name: 'verify', component: ADGroupMembersVerify },
    { path: '/', name: 'adgmembers', component: ADGroupMembers },
  ]
});

const TheNavigation = {
    mixins: [navmixin],
    template: '#nav-template',
    methods: {
      loader() {
        this.loading = true;
      },
      unsetmsg: function(){
        this.navscreenmsg = '';
      },
      updateSelf(e) {
        e.preventDefault();
        this.loading = true;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-self'));
        var notify = document.getElementById('email_notification').checked;
        var freq = document.querySelector('input[name="frequency"]:checked').value;
        if(notify == true){
          notify = 1;
        } else {
          notify = 0;
        }
        axios.post('https://web.bftv.ucdavis.edu/reporting/user-self-update.php', {
          crossDomain: true,
          myid: this.username,
          token: this.token,
          notification: notify, frequency: freq,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          this.navscreenmsg = response.data.message,
          this.navscreenmsgtype = "success",
          this.navscreenmsgicon = this.successicon
        }).catch(error => {
          if(error.response.data.message){
            this.navscreenmsg = error.response.data.message
          } else if(error.data.message){
            this.navscreenmsg = error.data.message
          } else {
            this.navscreenmsg = error.message
          }
          this.navscreenmsgtype = "error",
          this.navscreenmsgicon = this.erroricon
        }).finally(() => {
          modal.hide();
          this.loading = false;
        });
        window.scrollTo(0, 400);
      },
    }
};

const app = Vue.createApp({});
app.component('the-navigation', TheNavigation);
app.use(router);
app.mount('#reporting-block');
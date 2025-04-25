import { createRouter, createWebHashHistory } from 'vue-router';
//import components
import UserManagement from './components/UserManagement.vue';
import DepartmentManagement from './components/DepartmentManagement.vue';
import CollegeManagement from './components/CollegeManagement.vue';
import ADGroupManagement from './components/ADGroupManagement.vue';
import ADGroupMembers from './components/ADGroupMembers.vue';
import ADGroupMembersVerify from './components/ADGroupMembersVerify.vue';
import DeviceManagement from './components/DeviceManagement.vue';
import ADGroupSync from './components/ADGroupSync.vue';
import ImportData from './components/ImportData.vue';

//import mixins
import store from './store';

const router = createRouter({
  history: createWebHashHistory(),
  linkExactActiveClass: "active",
  linkActiveClass: "active",
  routes: [
    { path: '/departments', name: 'departments', component: DepartmentManagement },
    { path: '/colleges', name: 'colleges', component: CollegeManagement },
    { path: '/adgroups', name: 'adgroups', component: ADGroupManagement },
    { path: '/users', name: 'users', component: UserManagement },
    { path: '/sync', name: 'sync', component: ADGroupSync },
    { path: '/import', name: 'import', component: ImportData },
    { path: '/verify', name: 'verify', component: ADGroupMembersVerify },
    { path: '/devices', name: 'devices', component: DeviceManagement },
    { path: '/', name: 'adgmembers', component: ADGroupMembers },
  ]
});

const TheNavigation = {
  template: '#nav-template',
  data: function() {
    return {
      navscreenmsg: "",
      navscreenmsgtype: "",
      navscreenmsgicon: "",
      naverroricon: "far fa-times-circle fa-2x alert--error-icon",
      navsuccessicon: "far fa-check-circle fa-2x alert--success-icon"
    }
  },
  created() {
    this.$store.dispatch('fetchCurlData');
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
      } else if(role == 'orgreportviewer'){
          crole = 'OrgReportViewer'
      } else if(role == 'labadmin'){
          crole = 'LabAdmin'
      } else if(role == 'labreportviewer'){
          crole = 'LabReportViewer'
      } else {
          crole = 'none'
      }
      return crole;
    },
    unsetmsg: function(){
      this.navscreenmsg = '';
    },
    authenticate(){
      var w = 600;
      var h = 800;
      var url = 'https://web.bftv.ucdavis.edu/reporting/auth.php';
      var LeftPosition = (screen.width) ? (screen.width-w)/2 : 0;
      var TopPosition = (screen.height) ? (screen.height-h)/2 : 0;
      var settings = 'height='+h+',width='+w+',top='+TopPosition+',left='+LeftPosition+',scrollbars=yes,resizable';
      var popupWindow = window.open(url,"CAS - Central Authentication Service",settings);
      window.addEventListener('message', function(e) {
          // e.data hold the message from child
          if(e.data == "Authenticated."){
              popupWindow.close();
              //return axios(originalRequest);
              this.location.reload();
          } else if (e.data == "Authentication failed."){
              popupWindow.close();
              return Promise.reject(e.data);
          }
      } , false);
    },
    updateSelf(e) {
      e.preventDefault();
      this.loading = true;
      var modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-self'));
      var notify = document.getElementById('email_notification').checked;
      var freq = null;
      if(document.querySelector('input[name="frequency"]:checked')){
        freq = document.querySelector('input[name="frequency"]:checked').value;
      }
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
  },
  computed: {
    curlRole: {
      get() {
        return this.$store.state.curlRole;
      },
      set(value) {
        this.$store.commit('setCurlRole', value);
      }
    },
    curlName: {
      get() {
        return this.$store.state.curlName;
      },
      set(value) {
        this.$store.commit('setCurlName', value);
      }
    },
    curlCode: {
      get() {
        return this.$store.state.curlCode;
      },
      set(value) {
        this.$store.commit('setCurlCode', value);
      }
    },
    curlDep: {
      get() {
        return this.$store.state.curlDep;
      },
      set(value) {
        this.$store.commit('setCurlDep', value);
      }
    },
    curlGrp: {
      get() {
        return this.$store.state.curlGrp;
      },
      set(value) {
        this.$store.commit('setCurlGrp', value);
      }
    },
    curlNotify: {
      get() {
        return this.$store.state.curlNotify;
      },
      set(value) {
        this.$store.commit('setCurlNotify', value);
      }
    },
    curlFreq: {
      get() {
        return this.$store.state.curlFreq;
      },
      set(value) {
        this.$store.commit('setCurlFreq', value);
      }
    },
    maskeduser: {
      get() {
        return this.$store.state.maskeduser;
      },
      set(value) {
        this.$store.commit('setMaskedUser', value);
      }
    },
    username() {
      return this.$store.state.username;
    },
    token() {
      return this.$store.state.token;
    },
    authenticated() {
      return this.$store.state.authenticated;
    },
    authText() {
      return this.$store.state.authText;
    },
    email() {
      return this.$store.state.email;
    },
    accessLevels() {
      return {
        accesslevel0: this.$store.state.accesslevel0,
        accesslevel0r: this.$store.state.accesslevel0r,
        accesslevel1: this.$store.state.accesslevel1,
        accesslevel1r: this.$store.state.accesslevel1r,
        accesslevel2: this.$store.state.accesslevel2
      };
    },
    viewmode() {
      return this.$store.state.viewmode;
    },
  },
};

const app = Vue.createApp({});
app.component('the-navigation', TheNavigation);
app.use(router);
app.use(store);
app.mount('#reporting-block');
import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: {
    username: drupalSettings.assignments.username,
    email: drupalSettings.assignments.useremail,
    role: drupalSettings.assignments.role,
    token: drupalSettings.assignments.token,
    curlCode: '',
    curlRole: '',
    curlName: '',
    curlDep: '',
    curlTeam: '',
    curlDev: '',
    authenticated: '',
    authText: '',
    accesslevel0s: false,
    accesslevel0r: false,
    accesslevel0: false,
    accesslevel1: false,
    accesslevel2: false,
    viewermode: false,
  },
  mutations: {
    setCurlCode(state, code) {
      state.curlCode = code;
    },
    setCurlRole(state, role) {
      state.curlRole = role;
    },
    setCurlName(state, name) {
      state.curlName = name;
    },
    setCurlDep(state, dep) {
      state.curlDep = dep;
    },
    setCurlTeam(state, team) {
      state.curlTeam = team;
    },
    setCurlDev(state, dev) {
      state.curlDev = dev;
    },
    setAuthenticated(state, auth) {
      state.authenticated = auth;
    },
    setAuthText(state, authtext) {
      state.authText = authtext;
    },
    setAccessLevels(state, { level0s, level0r, level0, level1, level2 }) {
      state.accesslevel0s = level0s;
      state.accesslevel0r = level0r;
      state.accesslevel0 = level0;
      state.accesslevel1 = level1;
      state.accesslevel2 = level2;
    },
    setViewerMode(state, mode) {
      state.viewermode = mode;
    },
  },
  actions: {
    fetchUserData({ commit, state }) {
      axios.post('https://web.bftv.ucdavis.edu/gsr/connector.php', {
        crossDomain: true,
        loginid: state.username,
        token: state.token,
        email: state.email,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        const data = response.data;
        commit('setCurlCode', data.response);
        if (data.response == 1 || data.response == 3) {
          commit('setCurlRole', data.userrole);
          commit('setCurlName', data.username);
          commit('setCurlDep', data.userdep);
          commit('setCurlTeam', data.userteam);
          commit('setAuthenticated', data.authenticated);
          commit('setCurlDev', data.userdev);
          if(data.authenticated){
            commit('setAuthText', 'Authenticated');
          } else {
            commit('setAuthText', 'not authenticated');
          }
          let accessLevels = { level0s: false, level0r: false, level0: false, level1: false, level2: false };
          switch (data.userrole) {
            case 'superadmin':
              accessLevels = { level0s: false, level0r: true, level0: true, level1: true, level2: true };
              break;
            case 'orgadmin':
              accessLevels = { level0s: false, level0r: true, level0: true, level1: true, level2: false };
              break;
            case 'editor':
              accessLevels = { level0s: false, level0r: false, level0: true, level1: false, level2: false };
              break;
            case 'viewer':
              accessLevels = { level0s: false, level0r: true, level0: false, level1: false, level2: false };
              break;
            case 'submitter':
              accessLevels = { level0s: true, level0r: false, level0: false, level1: false, level2: false };
              break;
          }
          commit('setAccessLevels', accessLevels);
          const viewerRoles = ['viewer', 'submitter'];
          commit('setViewerMode', viewerRoles.includes(data.userrole));
        } else {
          commit('setCurlRole', 'anonymous');
        }
      }).catch(error => {
        console.log(error);
      });
    },
    // ... other actions ...
  },
  getters: {
    // Add getters if needed
  }
});
